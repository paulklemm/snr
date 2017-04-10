import React from 'react';
import * as ReactFauxDOM from 'react-faux-dom'
import * as d3scale from 'd3-scale';
import * as d3axis from 'd3-axis';
import * as D3Selection from 'd3-selection';
import {range, extent, max, min} from 'd3-array';

let value = range(26).map((value, i) => Math.random());
let data = {
	sepalLength: [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9, 5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1, 5.4, 5.1, 4.6, 5.1, 4.8, 5.0, 5.0, 5.2, 5.2, 4.7, 4.8, 5.4, 5.2, 5.5, 4.9, 5.0, 5.5, 4.9, 4.4, 5.1, 5.0, 4.5, 4.4, 5.0, 5.1, 4.8, 5.1, 4.6, 5.3, 5.0, 7.0, 6.4, 6.9, 5.5, 6.5, 5.7, 6.3, 4.9, 6.6, 5.2, 5.0, 5.9, 6.0, 6.1, 5.6, 6.7, 5.6, 5.8, 6.2, 5.6, 5.9, 6.1, 6.3, 6.1, 6.4, 6.6, 6.8, 6.7, 6.0, 5.7, 5.5, 5.5, 5.8, 6.0, 5.4, 6.0, 6.7, 6.3, 5.6, 5.5, 5.5, 6.1, 5.8, 5.0, 5.6, 5.7, 5.7, 6.2, 5.1, 5.7, 6.3, 5.8, 7.1, 6.3, 6.5, 7.6, 4.9, 7.3, 6.7, 7.2, 6.5, 6.4, 6.8, 5.7, 5.8, 6.4, 6.5, 7.7, 7.7, 6.0, 6.9, 5.6, 7.7, 6.3, 6.7, 7.2, 6.2, 6.1, 6.4, 7.2, 7.4, 7.9, 6.4, 6.3, 6.1, 7.7, 6.3, 6.4, 6.0, 6.9, 6.7, 6.9, 5.8, 6.8, 6.7, 6.7, 6.3, 6.5, 6.2, 5.9],
	sepalWidth: [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1, 3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8, 3.4, 3.7, 3.6, 3.3, 3.4, 3.0, 3.4, 3.5, 3.4, 3.2, 3.1, 3.4, 4.1, 4.2, 3.1, 3.2, 3.5, 3.6, 3.0, 3.4, 3.5, 2.3, 3.2, 3.5, 3.8, 3.0, 3.8, 3.2, 3.7, 3.3, 3.2, 3.2, 3.1, 2.3, 2.8, 2.8, 3.3, 2.4, 2.9, 2.7, 2.0, 3.0, 2.2, 2.9, 2.9, 3.1, 3.0, 2.7, 2.2, 2.5, 3.2, 2.8, 2.5, 2.8, 2.9, 3.0, 2.8, 3.0, 2.9, 2.6, 2.4, 2.4, 2.7, 2.7, 3.0, 3.4, 3.1, 2.3, 3.0, 2.5, 2.6, 3.0, 2.6, 2.3, 2.7, 3.0, 2.9, 2.9, 2.5, 2.8, 3.3, 2.7, 3.0, 2.9, 3.0, 3.0, 2.5, 2.9, 2.5, 3.6, 3.2, 2.7, 3.0, 2.5, 2.8, 3.2, 3.0, 3.8, 2.6, 2.2, 3.2, 2.8, 2.8, 2.7, 3.3, 3.2, 2.8, 3.0, 2.8, 3.0, 2.8, 3.8, 2.8, 2.8, 2.6, 3.0, 3.4, 3.1, 3.0, 3.1, 3.1, 3.1, 2.7, 3.2, 3.3, 3.0, 2.5, 3.0, 3.4, 3.0],
	petalLength: [1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5, 1.7, 1.5, 1.0, 1.7, 1.9, 1.6, 1.6, 1.5, 1.4, 1.6, 1.6, 1.5, 1.5, 1.4, 1.5, 1.2, 1.3, 1.4, 1.3, 1.5, 1.3, 1.3, 1.3, 1.6, 1.9, 1.4, 1.6, 1.4, 1.5, 1.4, 4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.7, 3.3, 4.6, 3.9, 3.5, 4.2, 4.0, 4.7, 3.6, 4.4, 4.5, 4.1, 4.5, 3.9, 4.8, 4.0, 4.9, 4.7, 4.3, 4.4, 4.8, 5.0, 4.5, 3.5, 3.8, 3.7, 3.9, 5.1, 4.5, 4.5, 4.7, 4.4, 4.1, 4.0, 4.4, 4.6, 4.0, 3.3, 4.2, 4.2, 4.2, 4.3, 3.0, 4.1, 6.0, 5.1, 5.9, 5.6, 5.8, 6.6, 4.5, 6.3, 5.8, 6.1, 5.1, 5.3, 5.5, 5.0, 5.1, 5.3, 5.5, 6.7, 6.9, 5.0, 5.7, 4.9, 6.7, 4.9, 5.7, 6.0, 4.8, 4.9, 5.6, 5.8, 6.1, 6.4, 5.6, 5.1, 5.6, 6.1, 5.6, 5.5, 4.8, 5.4, 5.6, 5.1, 5.1, 5.9, 5.7, 5.2, 5.0, 5.2, 5.4, 5.1],
	petalWidth: [0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2, 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3, 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8],
	species: ["setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "setosa", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "versicolor", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica", "virginica"]
}

class Scatterplot extends React.Component {
	constructor(){
		super();
	}

	render() {

		let margin = {top: 20, right: 20, bottom: 30, left: 40},
			width = this.props.width - margin.left - margin.right,
			height = this.props.height - margin.top - margin.bottom;
		// const width = this.props.width;
		// const height = this.props.height;

		var x = d3scale.scaleLinear()
			.range([0, width])
			.domain([0, max(data.sepalWidth)]);

		var y = d3scale.scaleLinear()
			.range([height, 0])
			.domain([0, max(data.sepalLength)]);

		var xAxis = d3axis.axisBottom()
			.scale(x);

		var yAxis = d3axis.axisLeft()
			.scale(y);


		// var faux = ReactFauxDOM.createElement("g");
		var fauxAxes = new ReactFauxDOM.Element('g');
		// let svg = D3Selection.select(faux).append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //     .append("g")
  //     .attr("transform", `translate(${margin.left},${margin.top})`);
  		// svg.append("g")
	  D3Selection.select(fauxAxes).append("g")
		// svg.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0,${height})`)
			.call(xAxis);
		D3Selection.select(fauxAxes).append("g")
		// svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		// let test = div.toReact();

		const dots = [];
		for (var i = 0; i < data.species.length; i++) {
			const sepalWidth = data.sepalWidth[i];
			const sepalLength = data.sepalLength[i];
			// TODO Update Key
			dots.push(
				<circle className="dot" r={3.5} cx={x(sepalWidth)} cy={y(sepalLength)} key={i}></circle>
			);
		}
		// <path class="domain" stroke="#000" d="M0.5,6V0.5H400.5V6"></path><g class="tick" opacity="1" transform="translate(0,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">0</text></g><g class="tick" opacity="1" transform="translate(40,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">10</text></g><g class="tick" opacity="1" transform="translate(80,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">20</text></g><g class="tick" opacity="1" transform="translate(120,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">30</text></g><g class="tick" opacity="1" transform="translate(160,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">40</text></g><g class="tick" opacity="1" transform="translate(200,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">50</text></g><g class="tick" opacity="1" transform="translate(240,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">60</text></g><g class="tick" opacity="1" transform="translate(280,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">70</text></g><g class="tick" opacity="1" transform="translate(320,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">80</text></g><g class="tick" opacity="1" transform="translate(360,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">90</text></g><g class="tick" opacity="1" transform="translate(400,0)"><line stroke="#000" y2="6" x1="0.5" x2="0.5"></line><text fill="#000" y="9" x="0.5" dy="0.71em">100</text></g>
		// <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
		// 		<g transform={`translate(${margin.left},${margin.top})`}>
		// 			{test}
		// 		</g>
		// 	</svg>
		return (
			<div>
			<h1>bla</h1>
			<svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
				<g transform={`translate(${margin.left},${margin.top})`}>
				{fauxAxes.toReact()}
				{dots}
				</g>
			</svg>
			</div>
		);
		// <svg width={width} height={height}>
		// 	{axisGroup}
		// 	{dots}
		// </svg>
		// return (
		// 	test
		// );
	}
}

export default Scatterplot;