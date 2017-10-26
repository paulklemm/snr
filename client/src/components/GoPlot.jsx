import React from 'react';
import ReactDOM from 'react-dom';
// Import D3 stuff
import { scaleLinear } from 'd3-scale';
import { max, min, mean } from 'd3-array';
import { interpolateLab } from 'd3-interpolate';
// Material-UI Imports
import Tooltip from 'material-ui/Tooltip';
// Own components
import { objectValueToArray, isUndefined, getPercentageFromFloat } from './Helper.js';
import DatasetIcons from './DatasetIcons';

class GoPlot extends React.Component {
  constructor() {
    super();
    // Bind `this` to the individual functions
    this.onMouseLeaveRect = this.onMouseLeaveRect.bind(this);
    this.onMouseMoveRect = this.onMouseMoveRect.bind(this);
    this.state = {
      tooltip: '',
      debug: false,
    };
  }

  componentWillMount() {
    this.update();
  }

  componentWillUpdate() {
    this.update();
  }

  /**
   * React to mouse movement on rect elements
   *
   * @param {Event} event Mouse move event
   */
  onMouseMoveRect(event, id, val) {
    // Update select
    this.props.highlight.clear();
    this.props.highlight.push('selection', [this.props.dataset.getEntry(id)]);
    // Update App to account for new highlight
    this.props.forceUpdateApp();

    let dx = event.clientX - 55;
    let dy = event.clientY - 35;
    // The animation puts the parent div into relative positioning. Therefore we have to
    // reduce the offset information of the GoPlotHub parent element
    if (this.props.animated) {
      const domNode = ReactDOM.findDOMNode(this);
      dx -= domNode.parentElement.offsetLeft;
      dy -= domNode.parentElement.offsetTop;
    }
    console.log(`${dx}, ${dy}`);
    const tooltip = (
      <div
        className="tooltip"
        style={{
          position: 'absolute',
          left: dx,
          top: dy,
        }}
      >
        {`${id}, ${this.props.dimension}: ${val}`}
      </div>
    );

    this.setState({
      tooltip,
    });
  }

  /**
   * React on mouse leave event on rect elements
   */
  onMouseLeaveRect() {
    this.setState({
      tooltip: '',
    });
  }

  /**
   * Takes EnsemblIDs array and converts it to array of dimension values
   * based on the given dataset
   *
   * @param {Dataset} dataset
   * @param {String} dimension
   * @param {Array} ids
   */
  convertData(dataset, dimension, ids) {
    // Initialitze empty data array
    const data = [];
    // Iterate over all ids and get the values of `dimension` out of it
    // Get the index of the
    // data.push(dataset.getEntry(id, dimension));
    for (const id of ids) {
      data.push({
        val: dataset.getEntry(id, dimension),
        id,
      });
    }

    // Update the state
    // TODO: Move to State!
    this.data = data;
  }

  /**
   * React on changes of properties or state by updating the class members
   */
  update() {
    // Get the data
    if (this.props.drawWholeGO) {
      // Derive the data from all genes in the GO-term
      this.convertData(this.props.dataset, this.props.dimension, this.props.goTermSummary.genes);
    } else {
      // Derive data from all selected genes in GO-term
      this.convertData(this.props.dataset, this.props.dimension, this.props.goTerm.ids);
    }
    // Sort the data
    this.dataSorted = this.data.sort((a, b) => {
      // Sort undefined values at the very beginning
      if (a.val === b.val) return 0;
      if (a.val === undefined) return -1;
      if (b.val === undefined) return 1;
      return a.val - b.val;
    });
    // Calculate domain color space based on input props
    let domainMin;
    let domainMax;
    let domainMean;
    // Calculate the dimension boundaries dynamic from the minimum/maximum of the input data
    if (this.props.dimensionBoundariesDynamic) {
      // Use values of the data to determine transfer function
      let dataValues = objectValueToArray(this.data, 'val');
      // Remove undefined values from dataValues
      dataValues = dataValues.filter(Number);
      domainMin = min(dataValues);
      domainMean = mean(dataValues);
      domainMax = max(dataValues);
    } else {
      // Calculate the domain from given props
      domainMin = this.props.dimensionMin;
      domainMean = mean([this.props.dimensionMin, this.props.dimensionMax]);
      domainMax = this.props.dimensionMax;
    }
    if (this.state.debug) {
      console.log(
        `GoPlot ${this.props.goTerm
          .goId}: domainMin: ${domainMin}, domainMean: ${domainMean}, domainMax: ${domainMax}`,
      );
    }
    // Update scales
    this.colorScale = scaleLinear()
      .domain([domainMin, domainMean, domainMax])
      .range(['blue', 'rgba(0, 0, 0, 0)', '#ee6351'])
      .interpolate(interpolateLab);
    // Width scale
    this.widthScale = scaleLinear()
      .range([0, this.props.maxWidth])
      .domain([0, this.props.maxGeneCount]);
  }

  /**
   * Render bars as rect elements deriving color from data
   * @return {Array} List of svg rect elements
   */
  renderBars() {
    // Init empty array of rects
    const rects = [];
    // Get the data
    const data = this.dataSorted;
    // Width of the bar is the maximum width divided by the number of data elements
    const barWidth = this.widthScale(data.length) / data.length;
    // Iterate over each entry to add a bar
    data.forEach((val, index) => {
      rects.push(
        <rect
          width={barWidth}
          height={this.props.height}
          fill={isUndefined(val.val) ? 'gray' : this.colorScale(val.val)}
          x={barWidth * index}
          y={0}
          key={`Value ${val} + Index ${index} + ${this.props.goTerm.goId}`}
          onMouseMove={e => this.onMouseMoveRect(e, val.id, val.val)}
          onMouseLeave={this.onMouseLeaveRect}
        />,
      );
    });
    return rects;
  }

  render() {
    return (
      <div>
        <Tooltip id="tooltip-icon" title={this.props.goTermSummary.go_term_name} placement="top">
          <span
            className="gotermlabel"
            role="presentation"
            onClick={() => this.props.toggleGOTerm(this.props.goTerm.goId)}
          >
            <span
              style={{
                marginRight: this.props.drawIcon ? '5' : '0',
              }}
            >
              {this.props.drawIcon ? DatasetIcons[this.props.icon] : undefined}
            </span>
            {`${getPercentageFromFloat(this.props.goTerm.percentage)}%: ${this.props.goTerm.goId}`}
          </span>
        </Tooltip>
        <svg width={this.props.maxWidth} height={this.props.height}>
          {this.renderBars()}
        </svg>
        {this.state.tooltip}
      </div>
    );
  }
}

export default GoPlot;
