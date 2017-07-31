import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {max, min} from 'd3-array';
import Helper from './Helper';
import SelectionRectangle from './SelectionRectangle';
// eslint-disable-next-line
import {mouse, select} from 'd3-selection';
// Measure DOM Element in React: https://stackoverflow.com/questions/25371926/how-can-i-respond-to-the-width-of-an-auto-sized-dom-element-in-react
import Measure from 'react-measure';

const margin = {top: 10, right: 15, bottom: 20, left: 30};
// const margin = {top: 0, right: 0, bottom: 0, left: 0};
// Settings Example
// {
// 	x: 'pValue', 
// 	y: 'fc'}
// }

const styleSheet = {
	filteredCircle: {
		fillOpacity: '0.1'
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
		const width = (this.props.responsiveWidth && typeof this.state.responsiveWidth !== 'undefined') ? this.state.responsiveWidth : this.props.width;
		const height = (this.props.responsiveHeight && typeof this.state.responsiveHeight !== 'undefined') ? this.state.responsiveHeight : this.props.height;
		this.widthNoMargin = width - margin.left - margin.right;
		this.heightNoMargin = height - margin.top - margin.bottom;
	}

	setScale(x, y) {
		this.xScale = scaleLinear()
			.range([0, this.widthNoMargin])
			.domain([min(x), max(x)]);

		this.yScale = scaleLinear()
			.range([this.heightNoMargin, 0])
			.domain([min(y), max(y)]);
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
		let data = Helper.createDummyDataScatterplot(this.props.stressTest.elementCount);
		let settings = Helper.createDummySettingsScatterplot();
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

	// 
	/**
	 * Create array of SVG circle elements based on the input array
	 * @param {Integer} radius: Radius of the circles
	 * @param {Array} x: Array of values for x
	 * @param {Array} y: Array of values for y
	 * @param {Array} filtered: Array of boolean values indicating whether the element is filtered or not
	 */
	renderDots(radius, x, y, filtered = [], highlight = undefined) {
		// Keep track of the number of elements where one variable shows NaN
		this.numberOfNaN = {x: 0, y: 0};
		let dots = [];
		for (let i in x) {
			let currentX = x[i];
			let currentY = y[i];
			// Check whether the current element is filtered or not
			const currentIsFiltered = (typeof filtered[i] === 'undefined') ? false : filtered[i];
			// If the element is filtered, render the elements accordingly
			const currentStyle = currentIsFiltered ? styleSheet.filteredCircle : {};
			// Only create dot if x and y are numbers
			if (!isNaN(currentX) && !isNaN(currentY)) {
				// Check if we have to highlight the elements
				let cx = this.xScale(currentX); 
				let cy = this.yScale(currentY);
				let newRadius = (typeof highlight !== 'undefined' && cx >= highlight.minX && cx <= highlight.maxX && cy >= highlight.minY && cy <= highlight.maxY) ? radius + 3 : radius;
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

	handleMouseMove(event) {
		event.preventDefault();
		let selectionRectangle = this.state.selectionRectangle;
		if (selectionRectangle.isDrawing) {
			selectionRectangle.setEnd(event.nativeEvent.offsetX - margin.left, event.nativeEvent.offsetY - margin.top);
			this.setState({ selectionRectangle: selectionRectangle });
		}
	}

	handleMouseUp(event) {
		event.preventDefault();
		this.state.selectionRectangle.isDrawing = false;
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