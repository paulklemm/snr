import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import * as d3scale from 'd3-scale';
import * as d3axis from 'd3-axis';
import * as D3Selection from 'd3-selection';
import {max} from 'd3-array';
import Helper from './Helper';
// eslint-disable-next-line
import {mouse, select} from 'd3-selection';

const margin = {top: 20, right: 20, bottom: 30, left: 40};

class Scatterplot extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			width: props.width,
			height: props.height,
			data: props.data,
			settings: props.settings,
			tooltip: []
		};
		this.onMouseLeaveTooltip = this.onMouseLeaveTooltip.bind(this);
	}

	setMargin() {
		this.margin = margin;
		this.widthNoMargin = this.state.width - margin.left - margin.right;
		this.heightNoMargin = this.state.height - margin.top - margin.bottom;
	}

	setScale(x, y) {
		this.xScale = d3scale.scaleLinear()
			.range([0, this.widthNoMargin])
			.domain([0, max(x)]);

		this.yScale = d3scale.scaleLinear()
			.range([this.heightNoMargin, 0])
			.domain([0, max(y)]);
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

	renderAxes() {
		let xAxis = d3axis.axisBottom()
			.scale(this.xScale);

		let yAxis = d3axis.axisLeft()
			.scale(this.yScale);

		// let faux = ReactFauxDOM.createElement("g");
		let fauxAxes = new ReactFauxDOM.Element('g');
		D3Selection.select(fauxAxes).append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0,${this.heightNoMargin})`)
			.call(xAxis);
		D3Selection.select(fauxAxes).append("g")
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
				Tooltip of awesomeness
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
	renderDots(x, y, size){
		let dots = [];
		for (let i = 0; i < x.length; i++) {
			let currentX = x[i];
			let currentY = y[i];
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
		return dots;
	}

	renderAxisLabels(){
		let xLabel = this.state.settings.x.label;
		let yLabel = this.state.settings.y.label;
		let axisLabels = [];
		axisLabels.push(<text className='label' transform="rotate(-90)" y={6} dy=".71em" style={{'textAnchor': 'end'}} key={yLabel}>{yLabel}</text>);
		axisLabels.push(<text className='label' x={this.widthNoMargin} y={this.heightNoMargin - 6} style={{'textAnchor': 'end'}} key={xLabel}>{xLabel}</text>);
		return axisLabels;
	}

	handleClick(event, x, y){
		// https://stackoverflow.com/questions/42576198/get-object-data-and-target-element-from-onclick-event-in-react-js
		console.log(`Click Event on ${x}, ${y}`);
	}

	onMouseMove(e) {
		// let mySelect = select('.scatterplot');
		// console.log(mySelect.node());
		// console.log(mouse(mySelect.node()));
		// let container = mySelect['_groups'][0][0]
		// console.log(container);
		// let [x, y] = mouse(container);
		// this.setState({ mouseX: e.screenX, mouseY: e.screenY });
		// this.setState({ mouseX: x, mouseY: y });
	}

	// Hack: Attach D3js Event listener
	// https://swizec.com/blog/animating-with-react-redux-and-d3/swizec/6775
	componentDidUpdate(){
		// select('.scatterplot').on("mousemove", function() {
		// 	let {x, y} = mouse(this);
		// 	console.log(mouse(this));
		// 	// D3 cannot access state
		// 	//this.setState({ mouseX: x, mouseY: y });
		// });
		select('.scatterplot').on("mousemove", () => {
			// let {x, y} = mouse(this);
			// console.log(mouse(this));
			// D3 cannot access state
			// this.setState({ mouseX: x, mouseY: y });
		});
	}

	render() {

		let xVariableName = this.state.settings.x.variableName;
		let yVariableName = this.state.settings.y.variableName;

		// reset margin and scale in case they changed
		this.setMargin();
		this.setScale(this.state.data[xVariableName], this.state.data[yVariableName]);

		let axes = this.renderAxes();
		let dots = this.renderDots(this.state.data[xVariableName], this.state.data[yVariableName], 3);
		let axisLabels = this.renderAxisLabels();

		return (
			<div>
				<p>Mouse Position: {`${this.state.mouseX}, ${this.state.mouseY}`}</p>
				<svg 
					className="scatterplot"
					width={this.widthNoMargin + this.margin.left + this.margin.right} 
					height={this.heightNoMargin + this.margin.top + this.margin.bottom}
					onMouseMove={this.onMouseMove.bind(this)}>
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