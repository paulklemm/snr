import React from 'react';
import { pie, arc } from 'd3-shape';
// https://github.com/d3/d3-scale/blob/master/README.md#schemeCategory10
import { schemeCategory20 } from 'd3-scale';

// Code adapted from https://bl.ocks.org/mbostock/3887235

class Piechart extends React.Component {
  render() {
    const radius = Math.min(this.props.width, this.props.height) / 2;
    const pieGeneratorSlices = pie()(this.props.data);
    const arcGenerator = arc();
    const pieSlices = [];
    for (const i in pieGeneratorSlices) {
      // https://github.com/d3/d3-shape
      const pieSlice = pieGeneratorSlices[i];
      const current_d = arcGenerator({
        innerRadius: radius - 40,
        outerRadius: radius,
        startAngle: pieSlice.startAngle,
        endAngle: pieSlice.endAngle,
      });
      const labelCentroid = arcGenerator.centroid({
        innerRadius: radius - 20,
        outerRadius: radius - 20,
        startAngle: pieSlice.startAngle,
        endAngle: pieSlice.endAngle,
      });
      pieSlices.push(
        <g className="pieSlice" key={`${pieSlice.startAngle},${pieSlice.endAngle}`}>
          <path d={current_d} fill={schemeCategory20[i]} />
          <text transform={`translate(${labelCentroid})`} dy="0.35em">
            {this.props.data[i]}
          </text>
        </g>,
      );
    }
    return (
      <svg width={this.props.width} height={this.props.height}>
        <g
          className="pie"
          transform={`translate(${this.props.width / 2}, ${this.props.height / 2})`}
        >
          <g className="arc">{pieSlices}</g>
        </g>
      </svg>
    );
  }
}

export default Piechart;
