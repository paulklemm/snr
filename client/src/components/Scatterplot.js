import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {max, min} from 'd3-array';
import { createDummyDataScatterplot, createDummySettingsScatterplot, isUndefined } from './Helper';
import SelectionRectangle from './SelectionRectangle';
// eslint-disable-next-line
import {mouse, select} from 'd3-selection';
// Measure DOM Element in React: https://stackoverflow.com/questions/25371926/how-can-i-respond-to-the-width-of-an-auto-sized-dom-element-in-react
import Measure from 'react-measure';

const margin = {top: 10, right: 15, bottom: 20, left: 30};
// const margin = {top: 0, right: 0, bottom: 0, left: 0};
// Settings Example
// {
//   x: 'pValue', 
//   y: 'fc'}
// }

const styleSheet = {
  filteredCircle: {
    fillOpacity: '0.1'
  },
  highlightedCircle: {
    fillOpacity: '1',
    fill: 'red'
  },
  circle: {
    fillOpacity: '0.5'
  }
}

class Scatterplot extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tooltip: [],
      selectionRectangle: new SelectionRectangle()
    };
    this.onMouseLeaveTooltip = this.onMouseLeaveTooltip.bind(this);
    this.onMeasure = this.onMeasure.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  setMargin() {
    this.margin = margin;
    // When the scatterplot is included in a responsive layout, setting the width
    // by hard is a problem. Therefore check if we are in a responsive setting
    const width = (this.props.responsiveWidth && !isUndefined(this.state.responsiveWidth)) ? this.state.responsiveWidth : this.props.width;
    const height = (this.props.responsiveHeight && !isUndefined(this.state.responsiveHeight)) ? this.state.responsiveHeight : this.props.height;
    this.widthNoMargin = width - margin.left - margin.right;
    this.heightNoMargin = height - margin.top - margin.bottom;
    // Set the size of the selection rectangle
    this.state.selectionRectangle.setCanvasSize(this.widthNoMargin, this.heightNoMargin);
  }

  setScale(x, y) {
    this.xScale = scaleLinear()
      .range([0, this.widthNoMargin])
      .domain([min(x), max(x)]);
    
    this.xScaleReverse = scaleLinear()
      .range([min(x), max(x)])
      .domain([0, this.widthNoMargin]);

    this.yScale = scaleLinear()
      .range([this.heightNoMargin, 0])
      .domain([min(y), max(y)]);
    
    this.yScaleReverse = scaleLinear()
      .range([min(y), max(y)])
      .domain([this.heightNoMargin, 0]);
  }

//// Stresstest //////////////////

  attachStresstest() {
    this.timer = setInterval(
      () => this.stresstestTick(),
      this.props.stressTest.milliseconds
    );
  }

  componentDidMount() {
    // attach stresstest timer if defined
    if (this.props.stressTest !== undefined) {
      this.attachStresstest()
    }
  }

  componentWillUnmount() {
    // remove stresstest timer if it is defined
    if (this.props.stressTest !== undefined) {
      window.clearInterval(this.timer)
    }
  }

  stresstestTick() {
    let data = createDummyDataScatterplot(this.props.stressTest.elementCount);
    let settings = createDummySettingsScatterplot();
    this.setState({
      settings: settings,
      data: data
    });
  }

//// End Stresstest //////////////////

  // renderAxes expects xScale and yScale to be set prior to this call using setScale
  renderAxes() {
    let xAxis = axisBottom()
      .scale(this.xScale);

    let yAxis = axisLeft()
      .scale(this.yScale);

    let fauxAxes = new ReactFauxDOM.Element('g');
    select(fauxAxes).append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${this.heightNoMargin})`)
      .call(xAxis);
    select(fauxAxes).append("g")
      .attr("class", "y axis")
      .call(yAxis);
      return fauxAxes.toReact();
  }

  onMouseEnterTooltip(e, x, y) {
    let tooltip = [];
    let dx = this.xScale(x) + 5;
    let dy = this.yScale(y) + 5;
    tooltip.push(
      <text x={dx} y={dy} key={`${dx},${dy}`}>
        {`${x}, ${y}`}
      </text>
    );
    this.setState({
      tooltip: tooltip
    });
  }

  onMouseLeaveTooltip() {
    this.setState({
      tooltip: []
    });
  }

  renderDot(datapoint, idName, radius = 5) {
    for (let i in this.props.rnaSeqData.data)
      if (this.props.rnaSeqData.data[i][idName] === datapoint) {
        const x = this.props.rnaSeqData.data[i][this.props.xName];
        const y = this.props.rnaSeqData.data[i][this.props.yName];
        if (!isUndefined(x) && !isUndefined(y)) {
          const cx = this.xScale(x);
          const cy = this.yScale(y);
          return (
            <circle
              className="dot"
              r={radius}
              cx={cx}
              cy={cy}
              key={`${x},${y},highlighted`}
              onClick={(e) => this.handleClick(e, x, y)}
              onMouseEnter={(e) => this.onMouseEnterTooltip(e, x, y)}
              onMouseLeave={this.onMouseLeaveTooltip}
              style={styleSheet.highlightedCircle}
            >
            </circle>
          );
        }
      }
    return;
  }

  /**
   * Create array of SVG circle elements based on the input array
   * @param {Integer} radius: Radius of the circles
   * @param {Array} x: Array of values for x
   * @param {Array} y: Array of values for y
   * @param {Array} filtered: Array of boolean values indicating whether the element is filtered or not
   * @param {Object} hightlight: Highlight object consisting of minX, maxX, minY, maxY defining circles to highlight
   * @return {Array} Circle objects as array
   */
  renderDots(radius, x, y, filtered = [], highlight = undefined) {
    // Keep track of the number of elements where one variable shows NaN
    this.numberOfNaN = {x: 0, y: 0};
    let dots = [];
    for (let i in x) {
      let currentX = x[i];
      let currentY = y[i];
      // Check whether the current element is filtered or not
      const currentIsFiltered = (isUndefined(filtered[i])) ? false : filtered[i];
      // If the element is filtered, render the elements accordingly
      const currentStyle = currentIsFiltered ? styleSheet.filteredCircle : styleSheet.circle;
      // Only create dot if x and y are numbers
      if (!isNaN(currentX) && !isNaN(currentY)) {
        // Check if we have to highlight the elements
        let cx = this.xScale(currentX); 
        let cy = this.yScale(currentY);
        let newRadius = (!isUndefined(highlight) && cx >= highlight.minX && cx <= highlight.maxX && cy >= highlight.minY && cy <= highlight.maxY) ? radius + 1 : radius;
        dots.push(
          <circle 
            className="dot" 
            r={newRadius} 
            cx={cx} 
            cy={cy} 
            key={`${currentX},${currentY},${i}`}
            onClick={(e) => this.handleClick(e, currentX, currentY)}
            onMouseEnter={(e) => this.onMouseEnterTooltip(e, currentX, currentY)}
            onMouseLeave={this.onMouseLeaveTooltip}
            style={currentStyle}
            >
          </circle>
        );
      }
      else {
        if (isNaN(currentX)) this.numberOfNaN.x++;
        if (isNaN(currentY)) this.numberOfNaN.y++;
      }
    }
    return dots;
  }

  renderAxisLabels(xLabel, yLabel){
    let axisLabels = [];
    axisLabels.push(<text className='label' transform="rotate(-90)" y={6} dy=".71em" style={{'textAnchor': 'end'}} key={`yaxis_${yLabel}`}>{yLabel}</text>);
    axisLabels.push(<text className='label' x={this.widthNoMargin} y={this.heightNoMargin - 6} style={{ 'textAnchor': 'end' }} key={`xaxis_${xLabel}`}>{xLabel}</text>);
    return axisLabels;
  }

  handleClick(event, x, y){
    // https://stackoverflow.com/questions/42576198/get-object-data-and-target-element-from-onclick-event-in-react-js
    console.log(`Click Event on ${x}, ${y}`);
  }

  /**
   * Mouse down trigger event to draw brush.
   * @param {Object} event: Mouse event containing the position
   */
  handleMouseDown(event) {
    event.preventDefault();
    // Get the selection rectangle object
    let selectionRectangle = this.state.selectionRectangle;
    selectionRectangle.reset();
    selectionRectangle.isDrawing = true;
    // Tell the selection rectangle the size of the plot in case the window resized
    selectionRectangle.setCanvasSize(this.widthNoMargin, this.heightNoMargin)
    // Set start of the rectangle
    selectionRectangle.setStart(event.nativeEvent.offsetX - margin.left, event.nativeEvent.offsetY - margin.top);
    this.setState({ selectionRectangle: selectionRectangle });
  }

  /**
   * Mouse move event for adjusting brush size.
   * @param {Object} event: Mouse event containing the position
   */
  handleMouseMove(event) {
    event.preventDefault();
    let selectionRectangle = this.state.selectionRectangle;
    if (selectionRectangle.isDrawing) {
      selectionRectangle.setEnd(event.nativeEvent.offsetX - margin.left, event.nativeEvent.offsetY - margin.top);
      this.setState({ selectionRectangle: selectionRectangle });
    }
  }

  /**
   * Mouse up event to stop drawing the brush.
   * @param {Object} event: Mouse event containing the position
   */
  handleMouseUp(event) {
    event.preventDefault();
    let selectionRectangle = this.state.selectionRectangle;
    selectionRectangle.isDrawing = false;
    this.setState({
      selectionRectangle: selectionRectangle
    });
    // Propagate the filter with the current bounds of the rectangle
    if (this.state.selectionRectangle.boundsSet) {
      this.props.filter.setFilter(this.props.xName, this.xScaleReverse(this.state.selectionRectangle.bounds.minX), '>')
      this.props.filter.setFilter(this.props.xName, this.xScaleReverse(this.state.selectionRectangle.bounds.maxX), '<')
      // Since the coordinates from the bounds are starting in the upper left corner on y, we have to invert bounds here
      this.props.filter.setFilter(this.props.yName, this.yScaleReverse(this.state.selectionRectangle.bounds.maxY), '>')
      this.props.filter.setFilter(this.props.yName, this.yScaleReverse(this.state.selectionRectangle.bounds.minY), '<')
      this.props.forceUpdateApp();
    } else {
      // If no bounds are set, we have a click without mouse movement, which will remove all the filters
      // Remove filters
      this.props.filter.removeFilter(this.props.xName);
      this.props.filter.removeFilter(this.props.yName);
      this.props.forceUpdateApp();
    }
  }

  /**
   * When in a reactive context, the plot needs to get the width from the measure component.
   * This will set the state responsiveWidth and responsiveHeight
   * @param {object} measure Object created by react-measure component containing element width and height
   */
  onMeasure(measure) {
    if (this.props.responsiveWidth)
      this.setState({ responsiveWidth: measure.width })
    if (this.props.responsiveHeight)
      this.setState({ responsiveHeight: measure.height })
  }

  render() {
    if (this.props.x === undefined || this.props.y === undefined) {
      return (<div>no data</div>);
    }

    // reset margin and scale in case they changed
    this.setMargin();
    this.setScale(this.props.x, this.props.y);

    let axes = this.renderAxes();
    let dots = this.renderDots(3, this.props.x, this.props.y);
    let axisLabels = this.renderAxisLabels(this.props.xLabel, this.props.yLabel);

    return (
      <Measure
        bounds
        onMeasure={this.onMeasure}
      >
        {({ measureRef }) =>
        <div ref={measureRef}>
          { /* <p>#Elements NaN: {`${this.props.xLabel}: ${this.numberOfNaN.x}`}, Y: {`${this.props.yLabel}: ${this.numberOfNaN.y}`}</p> */ }
          <svg 
            className="scatterplot"
            onMouseDown={(e) => this.handleMouseDown(e)}
            onMouseMove={(e) => this.handleMouseMove(e)}
            onMouseUp={(e) => this.handleMouseUp(e)}
            width={this.widthNoMargin + this.margin.left + this.margin.right} 
            height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
            <g transform={`translate(${this.margin.left},${this.margin.top})`}>
              {axes}
              {dots}
              {axisLabels}
              {this.state.tooltip}
              {this.state.selectionRectangle.getRectangle()}
            </g>
          </svg>
        </div>
        }
      </Measure>
    );
  }
}

Scatterplot.propTypes = {
  responsiveWidth: PropTypes.bool,
  responsiveHeight: PropTypes.bool.isRequired,
  xLabel: PropTypes.string.isRequired,
  yLabel: PropTypes.string.isRequired,
  x: PropTypes.array.isRequired,
  y: PropTypes.array.isRequired,
}

export default Scatterplot;