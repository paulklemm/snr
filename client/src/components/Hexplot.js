import React from 'react';
import PropTypes from 'prop-types';
import SelectionRectangle from './SelectionRectangle';
import { hexbin as D3Hexbin } from 'd3-hexbin';
import { interpolateLab } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import Popover from 'material-ui/Popover';
import { findDOMNode } from 'react-dom';
import { Icon } from 'react-fa';
import IconButton from 'material-ui/IconButton';
import Switch from 'material-ui/Switch';
import Measure from 'react-measure';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Input from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
} from 'material-ui/List';
import Tooltip from 'material-ui/Tooltip';
import { applyTransformationArrays } from './TransformationHelper';
import Scatterplot from './Scatterplot';
import { objectValueToArray, isUndefined } from './Helper';
import GeneInfo from './GeneInfo';

const styleSheet = {
  filteredCircle: {
    fillOpacity: '0.1',
  },
  highlightedCircle: {
    fillOpacity: '1',
    fill: 'red',
  },
  circle: {
    fillOpacity: '0.5',
  },
};

// Important Links
// https://github.com/d3/d3-hexbin
// https://github.com/joelburget/d4/blob/master/demo/dynamic-hexbin.js
// https://bl.ocks.org/mbostock/4248145
// https://github.com/d3/d3-hexbin#_hexbin
// TODO: Add Colormap Legend
class Hexplot extends Scatterplot {
  constructor() {
    super();
    this.state = {
      renderDots: false,
      selectionRectangle: new SelectionRectangle(),
      popoverOpen: false,
    };
    this.onMeasure = this.onMeasure.bind(this);
  }

  createPointArray(x, y) {
    const pointArray = [];
    x.map((entry, i) => {
      const point = [this.xScale(x[i]), this.yScale(y[i])];
      pointArray.push(point);
      // We do not need to return anything here, but 'map' expects a return
      return point;
    });
    return pointArray;
  }

  static printHexagons(pointArray, hexRadius, maximum) {
    const hexbin = D3Hexbin().radius(hexRadius);
    const color = scaleLinear()
      .domain([0, maximum])
      .range(['rgba(0, 0, 0, 0)', '#ee6351'])
      .interpolate(interpolateLab);

    const hexagons = hexbin(pointArray).map(point => (
      <path
        d={hexbin.hexagon(hexRadius - 0.5)}
        transform={`translate(${point.x}, ${point.y})`}
        fill={color(point.length)}
        key={`${point.x},${point.y}`}
      />
    ));
    return hexagons;
  }

  /**
   * Create array of SVG circle elements based on the input array
   * Overwrites the renderDots function of Scatterplot
   * @param {Integer} radius: Radius of the circles
   * @param {Array} x: Array of values for x
   * @param {Array} y: Array of values for y
   * @param {Array} filtered: Array of boolean values indicating whether the element is filtered or not
   * @param {Object} hightlight: Highlight object consisting of minX, maxX, minY, maxY defining circles to highlight
   * @return {Array} Circle objects as array
   */
  renderDots(radius, x, y, filtered = [], highlight = undefined, data) {
    // Keep track of the number of elements where one variable shows NaN
    this.numberOfNaN = { x: 0, y: 0 };
    const dots = [];
    x.forEach((entry, index) => {
      const currentX = x[index];
      const currentY = y[index];
      // Check whether the current element is filtered or not
      const currentIsFiltered = isUndefined(filtered[index]) ? false : filtered[index];
      // If the element is filtered, render the elements accordingly
      const currentStyle = currentIsFiltered ? styleSheet.filteredCircle : styleSheet.circle;
      // Only create dot if x and y are numbers
      if (!isNaN(currentX) && !isNaN(currentY)) {
        // Check if we have to highlight the elements
        const cx = this.xScale(currentX);
        const cy = this.yScale(currentY);
        const newRadius =
          !isUndefined(highlight) &&
          cx >= highlight.minX &&
          cx <= highlight.maxX &&
          cy >= highlight.minY &&
          cy <= highlight.maxY
            ? radius + 1
            : radius;
        dots.push(
          <circle
            className="dot"
            r={newRadius}
            cx={cx}
            cy={cy}
            key={`${currentX},${currentY},${index}`}
            onClick={e => this.handleClick(e, currentX, currentY)}
            onMouseEnter={() => {
              const ensemblId = data[index].EnsemblID;
              this.props.clearHighlight();
              this.props.highlight.push('selection', [this.props.rnaSeqData.getEntry(ensemblId)]);
            }}
            style={currentStyle}
          />,
        );
      } else {
        if (isNaN(currentX)) this.numberOfNaN.x++;
        if (isNaN(currentY)) this.numberOfNaN.y++;
      }
    });
    return dots;
  }

  /**
   * Create tooltip on element with Id `ensemblId`
   * 
   * @param {string} ensemblId Id
   * @return {foreignObject} Tooltip element
   */
  createTooltip(ensemblId) {
    const { x, y } = this.getPositionById(ensemblId);
    if (!isUndefined(x) && !isUndefined(y)) {
      const tooltip = [];
      const dx = this.xScale(x) + 2;
      const dy = this.yScale(y) + 2;
      tooltip.push(
        <foreignObject
          width="1"
          height="1"
          x={dx}
          y={dy}
          key={`Tooltip_Gene: ${dx}, ${dy}, ${ensemblId}`}
        >
          <GeneInfo
            geneEntry={this.props.rnaSeqData.getEntry(ensemblId)}
            clearHighlight={this.props.clearHighlight}
          />
        </foreignObject>,
      );
      return tooltip;
    }
  }

  /**
   * Get HTML options pane
   * @return {html} options pane
   */
  getOptionsPane() {
    return (
      <div
        ref={(node) => {
          this.optionIconRef = node;
        }}
      >
        <IconButton
          aria-label="Options"
          style={{
            fontSize: 15,
            position: 'absolute',
            marginLeft: this.widthNoMargin,
            marginTop: 20,
          }}
          onClick={() => {
            this.setState({
              popoverOpen: !this.state.popoverOpen,
              anchorElPopoverY: findDOMNode(this.optionIconRef),
            });
          }}
        >
          <Icon name="bars" />
        </IconButton>
        <Popover
          open={this.state.popoverOpen}
          anchorEl={this.optionIconRef}
          onRequestClose={() => {
            this.setState({ popoverOpen: false });
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <div
            style={{
              padding: '10px',
              width: '320px',
            }}
          >
            <List subheader={<ListSubheader>Transformation</ListSubheader>}>
              <ListItem>
                <ListItemIcon>
                  <Icon name="bar-chart-o" />
                </ListItemIcon>
                <ListItemText primary="Transformation X-Axis" />
                <ListItemSecondaryAction>
                  <Select
                    value={this.props.xTransformation}
                    onChange={event => this.props.setTransformation('x', event.target.value)}
                    input={<Input />}
                  >
                    <MenuItem value="linear">linear</MenuItem>
                    <MenuItem value="-linear">-linear</MenuItem>
                    <MenuItem value="log2">log2</MenuItem>
                    <MenuItem value="-log2">-log2</MenuItem>
                    <MenuItem value="log10">log10</MenuItem>
                    <MenuItem value="-log10">-log10</MenuItem>
                    <MenuItem value="sqrt">sqrt</MenuItem>
                    <MenuItem value="-sqrt">-sqrt</MenuItem>
                  </Select>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Icon name="bar-chart-o" />
                </ListItemIcon>
                <ListItemText primary="Transformation Y-Axis" />
                <ListItemSecondaryAction>
                  <Select
                    value={this.props.yTransformation}
                    onChange={event => this.props.setTransformation('y', event.target.value)}
                    input={<Input />}
                  >
                    <MenuItem value="linear">linear</MenuItem>
                    <MenuItem value="-linear">-linear</MenuItem>
                    <MenuItem value="log2">log2</MenuItem>
                    <MenuItem value="-log2">-log2</MenuItem>
                    <MenuItem value="log10">log10</MenuItem>
                    <MenuItem value="-log10">-log10</MenuItem>
                    <MenuItem value="sqrt">sqrt</MenuItem>
                    <MenuItem value="-sqrt">-sqrt</MenuItem>
                  </Select>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Icon name="tag" />
                </ListItemIcon>
                <ListItemText primary="Axis labels" />
                <ListItemSecondaryAction>
                  <Select
                    value={this.props.axisValues}
                    onChange={event => this.props.setAxisValues(event.target.value)}
                    input={<Input />}
                  >
                    <MenuItem value="both">both</MenuItem>
                    <MenuItem value="transformed">transformed</MenuItem>
                    <MenuItem value="untransformed">not transformed</MenuItem>
                  </Select>
                </ListItemSecondaryAction>
              </ListItem>
              <ListSubheader>Render Genes as Dots</ListSubheader>
              <ListItem>
                <ListItemIcon>
                  <Icon name="dot-circle-o" />
                </ListItemIcon>
                <ListItemText primary="Max displayed dots" />
                <ListItemSecondaryAction>
                  <TextField
                    style={{ maxWidth: '90px' }}
                    label="# Maximum"
                    value={this.props.maximumRenderedDots}
                    onChange={e => this.props.setMaximumRenderedDots(e.target.value)}
                    type="number"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Icon name="dot-circle-o" />
                </ListItemIcon>
                <ListItemText primary="Genes as dots 🐢" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.state.renderDots}
                    onChange={(event, checked) => this.setState({ renderDots: checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Icon name="dot-circle-o" />
                </ListItemIcon>
                <ListItemText primary="Genes as dots on zoom" />
                <ListItemSecondaryAction>
                  <Switch
                    disabled={this.state.renderDots}
                    checked={this.props.showFilteredGenesAsDots}
                    onChange={(event, checked) => this.props.setShowFilteredGenesAsDots(checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListSubheader>Filtering</ListSubheader>
              <ListItem>
                <ListItemIcon>
                  <Icon name="search" />
                </ListItemIcon>
                <ListItemText primary="Zoom on filter" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.props.zoom}
                    onChange={(event, checked) => this.props.setZoom(checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Icon name="search" />
                </ListItemIcon>
                <ListItemText primary="Zoom on filter small mult." />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.props.zoomSmallMultiples}
                    onChange={(event, checked) => this.props.setZoomSmallMultiples(checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListSubheader>Highlight</ListSubheader>
              <ListItem>
                <ListItemIcon>
                  <Icon name="id-card-o" />
                </ListItemIcon>
                <ListItemText primary="Info in Small Multiples" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.props.renderGeneInfoInSmallMultiples}
                    onChange={(event, checked) => this.props.setRenderGeneInfoInSmallMultiples(checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>
        </Popover>
      </div>
    );
  }

  /**
   * Call App.js to set primary dataset to the one represented by this hexplot
   */
  setPrimaryDataset() {
    this.props.setPrimaryDataset(this.props.rnaSeqData.name);
  }

  render() {
    // Check if there is data available
    if (this.props.rnaSeqData.data === undefined || isUndefined(this.props.filter)) {
      return <div />;
    }
    // reset margin and scale in case they changed
    this.setMargin();
    // Get the whole data set even if it was filtered
    const data = this.props.rnaSeqData.getData(!this.props.zoom);
    // Get the filter for the data set, which is a boolean array
    // const filter = this.props.rnaSeqData.filtered;
    // setScale requires an array of numeric values for each dimension
    // therefore we have to convert it
    const xArrayRaw = objectValueToArray(data, this.props.xName);
    const yArrayRaw = objectValueToArray(data, this.props.yName);
    // Apply transformations
    const { xArray, yArray } = applyTransformationArrays(
      xArrayRaw,
      yArrayRaw,
      this.props.xTransformation,
      this.props.yTransformation,
      true,
    );

    // Get count of x and y array
    const dataCount = xArray.length === yArray.length ? xArray.length : 'data count mismatch';
    // yArray = yArray.map((elem) => elem < 0 ? Math.sqrt(elem * -1) * -1 : Math.sqrt(elem));
    this.setScale(xArray, yArray);

    // Set Selection rectangle according to the filters
    if (this.props.zoom && !this.state.selectionRectangle.isDrawing) {
      this.state.selectionRectangle.reset();
    } else {
      this.state.selectionRectangle.setRectangleByFilter(
        this.props.xName,
        this.props.yName,
        this.xScale,
        this.yScale,
        this.props.filter,
        this.props.xTransformation,
        this.props.yTransformation,
      );
    }
    // Render x and y axes and rotate labels if this is a small multiple
    const axes = this.renderAxes(this.props.isSmallMultiple);
    let dots = [];
    let filteredDots = [];
    if (
      this.state.renderDots ||
      (this.props.showFilteredGenesAsDots && this.props.zoom && this.props.filter.doesFilter())
    ) {
      if (this.state.selectionRectangle.boundsSet) {
        dots = this.renderDots(2, xArray, yArray, [], this.state.selectionRectangle.bounds, data);
      } else {
        dots = this.renderDots(2, xArray, yArray, [], undefined, data);
      }
    } else if (this.props.showFilteredGenesAsDots && this.props.filter.doesFilter()) {
      // We have to get the primary data set to get the filter from there
      // Get the filtered data
      const dataFiltered = this.props.rnaSeqData.getDataExternalFilter(this.props.primaryDataset);
      // Get x and y array
      const xArrayFilteredRaw = objectValueToArray(dataFiltered, this.props.xName);
      const yArrayFilteredRaw = objectValueToArray(dataFiltered, this.props.yName);
      // Apply transformations
      const {
        xArray: xArrayFiltered,
        yArray: yArrayFiltered,
        data: dataFilteredValid,
      } = applyTransformationArrays(
        xArrayFilteredRaw,
        yArrayFilteredRaw,
        this.props.xTransformation,
        this.props.yTransformation,
        true,
        dataFiltered,
      );
      // Render dots using the filtered array
      filteredDots = this.renderDots(
        2,
        xArrayFiltered,
        yArrayFiltered,
        [],
        this.state.selectionRectangle.bounds,
        dataFilteredValid,
      );
    }

    if (dots.length > this.props.maximumRenderedDots) {
      dots = [];
    }
    if (filteredDots.length > this.props.maximumRenderedDots) {
      filteredDots = [];
    }

    // Rename the labels based on the transformation
    const axisLabelPattern = (transformation, name) =>
      // If linear, use name, else use transformation(name)
      // If `this.props.axisValues` is set to untransformed, also use name
      // transformation !== 'linear' && this.props.axisValues !== 'untransformed'
      (transformation !== 'linear' ? `${transformation}(${name})` : name);
    const axisLabels = this.renderAxisLabels(
      axisLabelPattern(this.props.xTransformation, this.props.xName),
      axisLabelPattern(this.props.yTransformation, this.props.yName),
    );
    const pointArray = this.createPointArray(xArray, yArray);

    const hexagons = Hexplot.printHexagons(pointArray, this.props.hexSize, this.props.hexMax);
    // UI Element for enabling FormControlLabel
    const renderGenesOption = this.getOptionsPane();

    // Get highlights if there are any
    const highlight = this.props.highlight.groups.selection;
    let highlightObj = '';
    let tooltip = '';
    // Only highlight if highlight not undefined and no tooltip is shown (for primary plot)
    if (!isUndefined(highlight)) {
      const ensemblId = highlight[0];
      // Only create tooltip if this is the main window or small multiples tooltips are allowed
      tooltip = (!this.props.isSmallMultiple || this.props.renderGeneInfoInSmallMultiples) ? this.createTooltip(ensemblId) : '';
      // Only proceed if the array is equal to one
      if (highlight.length === 1) {
        highlightObj = this.renderDot(ensemblId);
      }
    }

    return (
      <Measure bounds onMeasure={this.onMeasure}>
        {({ measureRef }) => (
          <div ref={measureRef}>
            {this.props.showRenderGenesOption ? renderGenesOption : ''}
            <Tooltip title="Set as primary data set" placement="top">
            <span
              style={{
                fontSize: 9,
                color: 'gray',
                position: 'absolute',
                marginLeft: this.widthNoMargin - 50,
                marginTop: 12,
                cursor: 'pointer',
              }}
              onClick={() => this.setPrimaryDataset()}
            >
              {`${pointArray.length}/${dataCount} valid points`}
            </span>
            </Tooltip>
            <Tooltip title="Set as primary data set" placement="top">
            <span
              style={{
                fontSize: 9,
                color: 'gray',
                position: 'absolute',
                marginLeft: this.widthNoMargin - 50,
                cursor: 'pointer',
              }}
              onClick={() => this.setPrimaryDataset()}
            >
              <Icon name={this.props.rnaSeqData.icon} />
              {`${this.props.rnaSeqData.name}`}
            </span>
            </Tooltip>
            <svg
              className="hexagons"
              onMouseDown={e => this.handleMouseDown(e)}
              onMouseMove={e => this.handleMouseMove(e)}
              onMouseUp={e => this.handleMouseUp(e)}
              style={{ overflow: 'visible' }}
              width={this.widthNoMargin + this.margin.left + this.margin.right}
              height={this.heightNoMargin + this.margin.top + this.margin.bottom}
            >
              <g transform={`translate(${this.margin.left},${this.margin.top})`}>
                {hexagons}
                {dots}
                {filteredDots}
                {axes}
                {axisLabels}
                {highlightObj}
                {tooltip}
                {this.state.selectionRectangle.getRectangle()}
                />
              </g>
            </svg>
          </div>
        )}
      </Measure>
    );
  }
}

Hexplot.propTypes = {
  responsiveWidth: PropTypes.bool,
  responsiveHeight: PropTypes.bool,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  rnaSeqData: PropTypes.object.isRequired,
  hexSize: PropTypes.number.isRequired,
  hexMax: PropTypes.number.isRequired,
  showRenderGenesOption: PropTypes.bool.isRequired,
};

export default Hexplot;
