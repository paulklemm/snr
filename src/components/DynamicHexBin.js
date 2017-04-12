import React from 'react';
import {range} from 'd3-array';
import {hexbin as d3hexbin} from 'd3-hexbin';
import {randomNormal} from 'd3-random';
import {scaleLinear} from 'd3-scale';
import {interpolateLab} from 'd3-interpolate';

const width = 960;
const height = 500;
let i = -1;
let theta = 0;
const deltaTheta = 0.3;
const n = 2000;
const k = 100;

let randomX = randomNormal(width / 2, 80); let randomY = randomNormal(height / 2, 80);
let points = range(n).map(function() { return [randomX(), randomY()]; });

const color = scaleLinear()
  .domain([0, 10])
  .range(["rgba(0, 0, 0, 0)", "steelblue"])
  .interpolate(interpolateLab);

const hexbin = d3hexbin().radius(5);

export default class DynamicHexbin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {points};
  }

  componentDidMount() {
    this.handle = window.setInterval(() => { this._update(); }, 50000000);
  }

  componentWillUnmount() {
    window.clearInterval(this.handle);
  }

  _update() {
    theta += deltaTheta;
    randomX = randomNormal(width / 2 + 80 * Math.cos(theta), 80),
    randomY = randomNormal(height / 2 + 80 * Math.sin(theta), 80);

    for (let j = 0; j < k; ++j) {
      i = (i + 1) % n;
      points[i][0] = randomX();
      points[i][1] = randomY();
    }

    this.setState({ points });
  }

  render() {
    console.log("Hexbin");
    console.log(hexbin(this.state.points));
    const hexagons = hexbin(this.state.points).map(point => (
      <path
        d={hexbin.hexagon(4.9)}
        transform={`translate(${point.x}, ${point.y})`}
        fill={color(point.length)}
      />
    ));

    return (
      <svg width={width} height={height}>
        <g className="hexagons">
          {hexagons}
        </g>
      </svg>
    );
  }
}