import React from 'react';
import { scaleLinear } from 'd3-scale';
import { range } from 'd3-array';

let value = range(26).map((value, i) => Math.random());
let data = {
  name: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ],
  value: value
};

class BarChart extends React.Component {
  constructor() {
    super();
    this._update = this._update.bind(this);
    this.state = { data };
  }

  _update() {
    var value = range(26).map((value, i) => Math.random());

    var data = {
      name: this.state.data.name,
      value: value
    };
    this.setState({ data });
  }

  componentDidMount() {
    this.handle = window.setInterval(() => {
      this._update();
    }, 2000);
  }

  render() {
    const width = this.props.width;
    const height = this.props.height;

    const maxDatum = 1;

    const y = scaleLinear()
      .domain([0, maxDatum])
      .range([height, 0]);

    const barWidth = width / this.state.data.name.length;
    const bars = [];
    for (var i = 0; i < this.state.data.name.length; i++) {
      const name = this.state.data.name[i];
      const value = this.state.data.value[i];
      bars.push(
        <g transform={`translate(${i * barWidth}, 0)`} key={name}>
          <rect y={y(value)} height={height - y(value)} width={barWidth - 1} />
          <text x={barWidth / 2 - 6} y={y(value) - 15} dy=".75em">
            {name}
          </text>
        </g>
      );
    }
    return (
      <svg width={width} height={height}>
        {bars}
      </svg>
    );
  }
}

export default BarChart;
