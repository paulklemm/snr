import React from 'react';
// Import D3 stuff
import { scaleLinear } from 'd3-scale';
import { max, min, mean } from 'd3-array';
import { interpolateLab } from 'd3-interpolate';

class GoPlot extends React.Component {

	componentWillMount() {
		this.update();
	}

	componentWillUpdate() {
		this.update();
	}

	render() {
		return (
			<div>
				<svg width={this.props.width} height={this.props.height}>
					{this.renderBars()}
					<rect
						width={this.props.width}
						height={this.props.height}
						rx=""
						ry=""
						stroke="grey"
						strokeWidth="1"
						fillOpacity="0"
						strokeOpacity="1"
					/>
				</svg>
			</div>
		);
	}

	/**
	 * React on changes of properties or state by updating the class members
	 */
	update() {
		// Sort the data
		this.dataSorted = this.props.data.sort((a, b) => a - b);
		// Update scales
		this.colorScale = scaleLinear()
			.domain([min(this.props.data), mean(this.props.data), max(this.props.data)])
			.range(["blue", "rgba(0, 0, 0, 0)", "#ee6351"])
			.interpolate(interpolateLab);
	}

	/**
	 * Render bars as rect elements deriving color from data
	 * @return {Array} List of svg rect elements
	 */
	renderBars() {
		// Init empty array of rects
		let rects = [];
		// Get the data
		let data = this.dataSorted;
		// Calculate the width of the bars
		const barWidth = this.props.width / data.length;
		// Iterate over each entry to add a bar
		data.forEach((val, index) => {
			rects.push(
				<rect 
					width={ barWidth }
					height={ this.props.height }
					x={ barWidth * index }
					fill={ this.colorScale(val) }
					y={0}
				/>
			);
		});
		return rects;
	}
}

export default GoPlot;