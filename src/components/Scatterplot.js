import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import {scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {max, min} from 'd3-array';
import Helper from './Helper';
// eslint-disable-next-line
import {mouse, select} from 'd3-selection';
// Measure DOM Element in React: https://stackoverflow.com/questions/25371926/how-can-i-respond-to-the-width-of-an-auto-sized-dom-element-in-react
import Measure from 'react-measure';

const margin = {top: 20, right: 100, bottom: 30, left: 40};
// Settings Example
// {
// 	x: 'pValue', 
// 	y: 'fc'}
// }
class Scatterplot extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			tooltip: []
		};
		this.onMouseLeaveTooltip = this.onMouseLeaveTooltip.bind(this);
	}

	setMargin() {
		this.margin = margin;
		this.widthNoMargin = this.props.width - margin.left - margin.right;
		this.heightNoMargin = this.props.height - margin.top - margin.bottom;
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

		const MeasuredComp = () => (
		  <Measure onMeasure={({width}) => this.setState({width: width})}>
		    {({width}) => <div>My width is {width}</div>}
		  </Measure>
		)

		return (
			<div>
				{ MeasuredComp() }
				{ /* <p>#Elements NaN: {`${this.props.xLabel}: ${this.numberOfNaN.x}`}, Y: {`${this.props.yLabel}: ${this.numberOfNaN.y}`}</p> */ }
				<svg 
					className="scatterplot"
					width={this.widthNoMargin + this.margin.left + this.margin.right} 
					height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
					<g transform={`translate(${this.margin.left},${this.margin.top})`}>
						{axes}
						{dots}
						{axisLabels}
						{this.state.tooltip}
					</g>
				</svg>
			</div>
		);
	}
}

export default Scatterplot;