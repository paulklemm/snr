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

	// create array of circle SVG elements based on the input array
	renderDots(size, x, y) {
		// Keep track of the number of elements where one variable shows NaN
		this.numberOfNaN = {x: 0, y: 0};
		let dots = [];
		for (let i in x) {
			let currentX = x[i];
			let currentY = y[i];
			// Only create dot if x and y are numbers
			if (!isNaN(currentX) && !isNaN(currentY)) {
				dots.push(
					<circle 
						className="dot" 
						r={size} 
						cx={this.xScale(currentX)} 
						cy={this.yScale(currentY)} 
						key={`${currentX},${currentY},${i}`}
						onClick={(e) => this.handleClick(e, currentX, currentY)}
						onMouseEnter={(e) => this.onMouseEnterTooltip(e, currentX, currentY)}
						onMouseLeave={this.onMouseLeaveTooltip}>
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
		axisLabels.push(<text className='label' transform="rotate(-90)" y={6} dy=".71em" style={{'textAnchor': 'end'}} key={yLabel}>{yLabel}</text>);
		axisLabels.push(<text className='label' x={this.widthNoMargin} y={this.heightNoMargin - 6} style={{'textAnchor': 'end'}} key={xLabel}>{xLabel}</text>);
		return axisLabels;
	}

	handleClick(event, x, y){
		// https://stackoverflow.com/questions/42576198/get-object-data-and-target-element-from-onclick-event-in-react-js
		console.log(`Click Event on ${x}, ${y}`);
	}

	handleMouseDown(event) {
		console.log(`Mouse Down (${event.nativeEvent.offsetX}, ${event.nativeEvent.offsetY})`);
		this.state.selectionRectangle.setStart(event.nativeEvent.offsetX - margin.left, event.nativeEvent.offsetY - margin.bottom);
	}

	handleMouseMove(event) {
		console.log(`Mouse Move (${event.nativeEvent.offsetX}, ${event.nativeEvent.offsetY})`);
		let selectionRectangle = this.state.selectionRectangle;
		selectionRectangle.setCurrent(event.nativeEvent.offsetX - margin.left, event.nativeEvent.offsetY - margin.bottom);
		this.setState({ selectionRectangle: selectionRectangle });
	}

	handleMouseUp(event) {
		console.log(`Mouse Up (${event.nativeEvent.offsetX}, ${event.nativeEvent.offsetY})`);
		let selectionRectangle = this.state.selectionRectangle;
		selectionRectangle.reset();
		this.setState({ selectionRectangle: selectionRectangle });
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