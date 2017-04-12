import React from 'react';
import Scatterplot from './Scatterplot';
import {hexbin as D3Hexbin} from 'd3-hexbin';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';

class Hexplot extends Scatterplot {
	render() {
		let xVariableName = this.state.settings.x.variableName;
		let yVariableName = this.state.settings.y.variableName;

		const hexbin = D3Hexbin().radius(3);
		let color = scaleLinear()
			.domain([0, 5])
			.range(["rgba(0, 0, 0, 0)", "steelblue"])
			.interpolate(interpolateLab);

		const hexagons = hexbin([this.state.data[xVariableName], this.state.data[yVariableName]]).map(point => (
		  <path
		    d={hexbin.hexagon(10)}
		    transform={`translate(${point.x}, ${point.y})`}
		    fill={color(point.length)}
		  />
		));

		// <p>{`Hexplot Element 1: ${this.state.data[xVariableName][1]}`}</p>
		return(
			<svg width={this.state.width} height={this.state.height}>
        <g className="hexagons">
          {hexagons}
        </g>
      </svg>
		);
	}
}

export default Hexplot;