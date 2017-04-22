import React from 'react';
import {pie, arc} from 'd3-shape';

class Piechart extends React.Component {
	render() {
		let data = [1, 1, 2, 3, 5, 8, 13, 21];
		let pieSlices = pie()(data);
		let arcPaths = [];
		let arcGenerator = arc();
		for (let pieSlice in pieSlices) {
			// https://github.com/d3/d3-shape
			console.log(
				arc({
					innerRadius: 0,
					outerRadius: 100,
					startAngle: 0,
					endAngle: Math.PI / 2
				})
			);
		}
		console.log(pieSlices);
		return(
			<div>Piechart
				<g className="arc">
				</g>
			</div>
		);
	}
}

export default Piechart;