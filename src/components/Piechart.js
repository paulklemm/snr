import React from 'react';
import {pie, arc} from 'd3-shape';
// https://github.com/d3/d3-scale/blob/master/README.md#schemeCategory10
import {schemeCategory20} from 'd3-scale';

// Code adapted from https://bl.ocks.org/mbostock/3887235
// TODO: Add labels

class Piechart extends React.Component {
	render() {
		let radius = Math.min(this.props.width, this.props.height) / 2;
		let pieSlices = pie()(this.props.data);
		let arcGenerator = arc();
		let arcPaths = [];
		for (let i in pieSlices) {
			// https://github.com/d3/d3-shape
			let pieSlice = pieSlices[i]
			let current_d = arcGenerator({
				innerRadius: 0,
				outerRadius: radius,
				startAngle: pieSlice.startAngle,
				endAngle: pieSlice.endAngle
			});
			arcPaths.push(
				<path 
					d={current_d}
					key={`${pieSlice.startAngle},${pieSlice.endAngle}`}
					fill={schemeCategory20[i]}>
				</path>
			);
		}
		return(
			<svg width={this.props.width} height={this.props.height}>
				<g className="pie" transform={`translate(${this.props.width / 2}, ${this.props.height / 2})`}>
					<g className="arc">
						{arcPaths}
					</g>
				</g>
			</svg>
		);
	}
}

export default Piechart;