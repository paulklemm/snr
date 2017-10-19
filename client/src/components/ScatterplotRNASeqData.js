import React from 'react';
import Scatterplot from './Scatterplot';
import { objectValueToArray } from './Helper';

class ScatterplotRNASeqData extends Scatterplot {
  render() {
    // Check if there is data available
    if (this.props.rnaSeqData.data === undefined) return <div>no data</div>;
    // reset margin and scale in case they changed
    this.setMargin();
    // setScale requires an array of numeric values for each dimension
    // therefore we have to convert it
    const xArray = objectValueToArray(this.props.rnaSeqData.data, this.props.xName);
    const yArray = objectValueToArray(this.props.rnaSeqData.data, this.props.yName);
    this.setScale(xArray, yArray);

    const axes = this.renderAxes();
    const dots = this.renderDots(3, xArray, yArray);
    const axisLabels = this.renderAxisLabels(this.props.xName, this.props.yName);

    return (
      <div>
        <p>
          #Elements NaN: {`${this.props.xName}: ${this.numberOfNaN.x}`}, Y:{' '}
          {`${this.props.yName}: ${this.numberOfNaN.y}`}
        </p>
        <svg
          className="scatterplot"
          width={this.widthNoMargin + this.margin.left + this.margin.right}
          height={this.heightNoMargin + this.margin.top + this.margin.bottom}
        >
          <g transform={`translate(${this.margin.left},${this.margin.top})`}>
            {axes}
            {dots}
            {axisLabels}
            {this.state.tooltip}
          </g>
        </svg>
      </div>
    );
  }
}

export default ScatterplotRNASeqData;
