import React from 'react';
import Scatterplot from './Scatterplot';
import {hexbin as D3Hexbin} from 'd3-hexbin';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';

// Important Links
// https://github.com/d3/d3-hexbin
// https://github.com/joelburget/d4/blob/master/demo/dynamic-hexbin.js
// https://bl.ocks.org/mbostock/4248145
// https://github.com/d3/d3-hexbin#_hexbin
// TODO: Add Colormap Legend
class Hexplot extends Scatterplot {

	createPointArray(x, y) {
		let pointArray = [];
		x.map((entry, i) => {
			let point = [this.xScale(x[i]), this.yScale(y[i])];
			pointArray.push(point);
		});
		return pointArray;
	}

	static printHexagons(pointArray, hexRadius, maximum) {
		let hexbin = D3Hexbin().radius(hexRadius);
		let color = scaleLinear()
			.domain([0, maximum])
			.range(["rgba(0, 0, 0, 0)", "steelblue"])
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

	render() {

		let xVariableName = this.state.settings.x.variableName;
		let yVariableName = this.state.settings.y.variableName;

		// reset margin and scale in case they changed
		this.setMargin();
		this.setScale(this.state.data[xVariableName], this.state.data[yVariableName]);

		let axes = this.renderAxes();
		let axisLabels = this.renderAxisLabels();
		let dots = this.renderDots(this.state.data[xVariableName], this.state.data[yVariableName], 1);
		let pointArray = this.createPointArray(this.state.data[xVariableName], this.state.data[yVariableName]);

		const hexagons = Hexplot.printHexagons(pointArray, this.props.hexSize, this.props.hexMax);

		// <p>{`Hexplot Element 1: ${this.state.data[xVariableName][1]}`}</p>
		return(
			<svg width={this.widthNoMargin + this.margin.left + this.margin.right} height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
				<g className="hexagons" transform={`translate(${this.margin.left},${this.margin.top})`}>
					{hexagons}
					{dots}
					{axes}
					{axisLabels}
				</g>
			</svg>
		);
	}
}

export default Hexplot;