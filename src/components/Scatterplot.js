import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import * as d3scale from 'd3-scale';
import * as d3axis from 'd3-axis';
import * as D3Selection from 'd3-selection';
import {max} from 'd3-array';
import Helper from './Helper';

const margin = {top: 20, right: 20, bottom: 30, left: 40};

class Scatterplot extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			width: props.width,
			height: props.height,
			data: props.data,
			settings: props.settings
		};
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

	// create array of circle SVG elements based on the input array
	renderDots(x, y, size){
		let dots = [];
		for (let i = 0; i < x.length; i++) {
			let currentX = x[i];
			let currentY = y[i];
			dots.push(
				<circle className="dot" r={size} cx={this.xScale(currentX)} cy={this.yScale(currentY)} key={`${currentX},${currentY},${i}`}></circle>
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

	render() {

		let xVariableName = this.state.settings.x.variableName;
		let yVariableName = this.state.settings.y.variableName;

		// reset margin and scale in case they changed
		this.setMargin();
		this.setScale(this.state.data[xVariableName], this.state.data[yVariableName]);

		let axes = this.renderAxes();
		let dots = this.renderDots(this.state.data[xVariableName], this.state.data[yVariableName], 1.5);
		let axisLabels = this.renderAxisLabels();

		return (
			<svg width={this.widthNoMargin + this.margin.left + this.margin.right} height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
				<g transform={`translate(${this.margin.left},${this.margin.top})`}>
					{axes}
					{dots}
					{axisLabels}
				</g>
			</svg>
		);
	}
}

// Proptypes are deprecated
// https://stackoverflow.com/questions/43303761/accessing-proptypes-via-the-main-react-package-is-deprecated
// Scatterplot.propTypes = {
// 	width: React.PropTypes.number.isRequired,
// 	height: React.PropTypes.number.isRequired,
// 	data: React.PropTypes.object.isRequired,
// 	settings: React.PropTypes.object.isRequired
// };

export default Scatterplot;