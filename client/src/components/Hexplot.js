import React from 'react';
import PropTypes from 'prop-types';
import Scatterplot from './Scatterplot';
import { objectValueToArray, isUndefined } from './Helper';
import SelectionRectangle from './SelectionRectangle';
import {hexbin as D3Hexbin} from 'd3-hexbin';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import { FormControlLabel } from 'material-ui/Form';
import Popover from 'material-ui/Popover';
import { findDOMNode } from 'react-dom';
import { Icon } from 'react-fa';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Switch from 'material-ui/Switch';
import Measure from 'react-measure';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Input, { InputLabel } from 'material-ui/Input';
import { applyTransformationArray } from './TransformationHelper';
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
} from 'material-ui/List';

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
      popoverOpen: false
    };
    this.onMeasure = this.onMeasure.bind(this);
  }

  createPointArray(x, y) {
    let pointArray = [];
    x.map((entry, i) => {
      let point = [this.xScale(x[i]), this.yScale(y[i])];
      pointArray.push(point);
      // We do not need to return anything here, but 'map' expects a return
      return point;
    });
    return pointArray;
  }

  static printHexagons(pointArray, hexRadius, maximum) {
    let hexbin = D3Hexbin().radius(hexRadius);
    let color = scaleLinear()
      .domain([0, maximum])
      .range(["rgba(0, 0, 0, 0)", "#ee6351"])
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
            marginLeft: this.widthNoMargin
          }}
          onClick={() => {
            this.setState({
              popoverOpen: !this.state.popoverOpen,
              anchorElPopoverY: findDOMNode(this.optionIconRef)
            });
          }}
        >
          <Icon
            name="bars"
          />
        </IconButton>
        <Popover
          open={this.state.popoverOpen}
          anchorEl={this.optionIconRef}
          onRequestClose={() => { this.setState({ popoverOpen: false }); }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <div style={{
            padding: '10px',
            width: '320px'
          }}
          >
            <List subheader={<ListSubheader>Settings</ListSubheader>}>
              <ListItem>
                <ListItemIcon>
                  <Icon name="bar-chart-o" />
                </ListItemIcon>
                <ListItemText primary="Transformation X-Axis" />
                <ListItemSecondaryAction>
                  <Select
                    value={this.props.xTransformation}
                    onChange={(event) => this.props.setTransformation('x', event.target.value)}
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
                    onChange={(event) => this.props.setTransformation('y', event.target.value)}
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
                  <Icon name="dot-circle-o" />
                </ListItemIcon>
                <ListItemText primary="Plot genes as dots 🐢" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={this.state.renderDots}
                    onChange={(event, checked) => this.setState({ renderDots: checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
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
            </List>
          </div>
        </Popover>
      </div>);
  }

  render() {
    // Check if there is data available
    if (this.props.rnaSeqData.data === undefined || isUndefined(this.props.filter)) return (<div>no data</div>);
    // reset margin and scale in case they changed
    this.setMargin();
    // Get the whole data set even if it was filtered
    const data = this.props.rnaSeqData.getData(!this.props.zoom);
    // const data = this.props.rnaSeqData.getData(true);
    // Get the filter for the data set, which is a boolean array
    const filter = this.props.rnaSeqData.filtered;
    // setScale requires an array of numeric values for each dimension
    // therefore we have to convert it
    let xArray = objectValueToArray(data, this.props.xName);
    let yArray = objectValueToArray(data, this.props.yName);
    // Apply transformations
    xArray = applyTransformationArray(xArray, this.props.xTransformation);
    yArray = applyTransformationArray(yArray, this.props.yTransformation);
    // yArray = yArray.map((elem) => elem < 0 ? Math.sqrt(elem * -1) * -1 : Math.sqrt(elem));
    this.setScale(xArray, yArray);

    // Set Selection rectangle according to the filters
    if (this.props.zoom && !this.state.selectionRectangle.isDrawing) {
      this.state.selectionRectangle.reset();
    } else {
      this.state.selectionRectangle.setRectangleByFilter(this.props.xName, this.props.yName, this.xScale, this.yScale, this.props.filter, this.props.xTransformation, this.props.yTransformation);
    }

    let axes = this.renderAxes();
    let dots = [];
    if (this.state.renderDots) {
      if (this.state.selectionRectangle.boundsSet) {
        dots = this.renderDots(1, xArray, yArray, filter, this.state.selectionRectangle.bounds);
      } else {
        dots = this.renderDots(1, xArray, yArray, filter);
      }
    }
    // Rename the labels based on the transformation
    const axisLabelPattern = (transformation, name) => {
      // If linear, use name, else use transformation(name)
      return transformation !== 'linear' ? `${transformation}(${name})` : name;
    };
    const axisLabels = this.renderAxisLabels(
      axisLabelPattern(this.props.xTransformation, this.props.xName),
      axisLabelPattern(this.props.yTransformation, this.props.yName)
    );
    const pointArray = this.createPointArray(xArray, yArray);

    const hexagons = Hexplot.printHexagons(pointArray, this.props.hexSize, this.props.hexMax);
    // UI Element for enabling FormControlLabel
    const renderGenesOption = this.getOptionsPane();

    // Get highlights if there are any
    const highlight = this.props.highlight.groups['selection'];
    let highlightObj = '';
    if (!isUndefined(highlight)) {
      // Only proceed if the array is equal to one
      if (highlight.length === 1) {
        highlightObj = this.renderDot(highlight[0], this.props.highlight.idName);
      }
    }

    return (
      <Measure
        bounds
        onMeasure={this.onMeasure}
      >
        {({ measureRef }) =>
        <div ref={measureRef}>
          {this.props.showRenderGenesOption ? renderGenesOption : ''}
          <svg 
              className="hexagons"
              onMouseDown={(e) => this.handleMouseDown(e)}
              onMouseMove={(e) => this.handleMouseMove(e)}
              onMouseUp={(e) => this.handleMouseUp(e)}
              width={this.widthNoMargin + this.margin.left + this.margin.right} 
              height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
            <g transform={`translate(${this.margin.left},${this.margin.top})`}>
              {hexagons}
              {dots}
              {axes}
              {axisLabels}
              {highlightObj}
              {this.state.tooltip}
              {this.state.selectionRectangle.getRectangle()}
              />
            </g>
          </svg>
        </div>
        }
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
  showRenderGenesOption: PropTypes.bool.isRequired
}

export default Hexplot;