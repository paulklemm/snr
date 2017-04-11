import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import * as d3scale from 'd3-scale';
import * as d3axis from 'd3-axis';
import * as D3Selection from 'd3-selection';
import {max} from 'd3-array';
import Helper from './Helper';

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

//// Stresstest //////////////////

	attachStresstest() {
		this.timerID = setInterval(
			() => this.stresstestTick(),
			this.props.stressTest.milliseconds
		);
	}

	componentDidMount() {
		if (this.props.stressTest !== undefined) {
			this.attachStresstest()
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

	render() {
		let xVariableName = this.state.settings.x.variableName;
		let yVariableName = this.state.settings.y.variableName;
		let xLabel = this.state.settings.x.label;
		let yLabel = this.state.settings.y.label;

		let margin = {top: 20, right: 20, bottom: 30, left: 40},
			width = this.state.width - margin.left - margin.right,
			height = this.state.height - margin.top - margin.bottom;

		let x = d3scale.scaleLinear()
			.range([0, width])
			.domain([0, max(this.state.data[xVariableName])]);

		let y = d3scale.scaleLinear()
			.range([height, 0])
			.domain([0, max(this.state.data[yVariableName])]);

		let xAxis = d3axis.axisBottom()
			.scale(x);

		let yAxis = d3axis.axisLeft()
			.scale(y);


		// let faux = ReactFauxDOM.createElement("g");
		let fauxAxes = new ReactFauxDOM.Element('g');
		D3Selection.select(fauxAxes).append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0,${height})`)
			.call(xAxis);
		D3Selection.select(fauxAxes).append("g")
			.attr("class", "y axis")
			.call(yAxis);

		let dots = [];
		for (let i = 0; i < this.state.data[xVariableName].length; i++) {
			let currentX = this.state.data[xVariableName][i];
			let currentY = this.state.data[yVariableName][i];
			// TODO Update Key
			dots.push(
				<circle className="dot" r={1} cx={x(currentX)} cy={y(currentY)} key={i}></circle>
			);
		}

		return (
			<svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
				<g transform={`translate(${margin.left},${margin.top})`}>
					{fauxAxes.toReact()}
					{dots}
					{ /* Add Axis labels */}
					<text className='label' transform="rotate(-90)" y={6} dy=".71em" style={{'textAnchor': 'end'}}>{yLabel}</text>
					<text className='label' x={width} y={height - 6} style={{'textAnchor': 'end'}}>{xLabel}</text>
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