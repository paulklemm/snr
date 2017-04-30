import React from 'react';
import Scatterplot from './Scatterplot';
import Helper from './Helper';
import {hexbin as D3Hexbin} from 'd3-hexbin';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import Checkbox from 'material-ui/Checkbox';
import Switch from 'material-ui/Switch';

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
			// We do not need to return anything here, but 'map' expects a return
			return point;
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
		// Check if there is data available
		if (this.props.rnaSeqData.data === undefined) return (<div>no data</div>);
		// reset margin and scale in case they changed
		this.setMargin();
		// setScale requires an array of numeric values for each dimension
		// therefore we have to convert it
		let xArray = Helper.objectValueToArray(this.props.rnaSeqData.data, this.props.xName)
		let yArray = Helper.objectValueToArray(this.props.rnaSeqData.data, this.props.yName)
		this.setScale(xArray, yArray);

		let axes = this.renderAxes();
		// let dots = this.renderDots(3, xArray, yArray);
		let axisLabels = this.renderAxisLabels(this.props.xName, this.props.yName);
		let pointArray = this.createPointArray(xArray, yArray);

		let hexagons = Hexplot.printHexagons(pointArray, this.props.hexSize, this.props.hexMax);

		let style = {
			width: this.widthNoMargin + this.margin.left + this.margin.right,
			height: this.heightNoMargin + this.margin.top + this.margin.bottom
		};

		return(
			<div
				style={style}>
			<svg 
					className="hexagons"
					width={this.widthNoMargin + this.margin.left + this.margin.right} 
					height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
				<g transform={`translate(${this.margin.left},${this.margin.top})`}>
					{hexagons}
					{ /* dots */ }
					{axes}
					{axisLabels}
				</g>
			</svg>
			<Checkbox />
			<Switch />
			</div>
		);
	}
}

export default Hexplot;