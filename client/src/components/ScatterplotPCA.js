import React from 'react';
import Measure from 'react-measure';
import Scatterplot from './Scatterplot';
import { isUndefined } from './Helper';

class ScatterplotPCA extends Scatterplot {
  constructor(props) {
    super(props);
    console.log("ScatterplotPCA props");
    console.log(props);
    this.updateWithNewProps(props);
  }

  propsAreValid(nextProps) {
    return (
      !isUndefined(nextProps.x) &&
      !isUndefined(nextProps.y)
    )
  }

  updateWithNewProps(nextProps) {
    if (!this.propsAreValid(nextProps)) { return; }

    this.setScale(nextProps.x, nextProps.y);
    this.axes = this.renderAxes();
    this.dots = this.renderDots(3, nextProps.x, nextProps.y);
    this.axisLabels = this.renderAxisLabels(nextProps.xLabel, nextProps.yLabel);
  }

  componentWillReceiveProps(nextProps) {
    this.updateWithNewProps(nextProps);
  }

  render() {
    if (this.props.x === undefined ||  this.props.y === undefined) {
      return (<div>no data</div>);
    }

    // reset margin and scale in case they changed
    this.setMargin();

    return (
      <Measure
        bounds
        onMeasure={this.onMeasure}
      >
        {({ measureRef }) =>
          <div ref={measureRef}>
            { /* <p>#Elements NaN: {`${this.props.xLabel}: ${this.numberOfNaN.x}`}, Y: {`${this.props.yLabel}: ${this.numberOfNaN.y}`}</p> */}
            <svg
              className="scatterplot"
              onMouseDown={(e) => this.handleMouseDown(e)}
              onMouseMove={(e) => this.handleMouseMove(e)}
              onMouseUp={(e) => this.handleMouseUp(e)}
              width={this.widthNoMargin + this.margin.left + this.margin.right}
              height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
              <g transform={`translate(${this.margin.left},${this.margin.top})`}>
                {this.axes}
                {this.dots}
                {this.axisLabels}
                {this.state.tooltip}
                {this.state.selectionRectangle.getRectangle()}
              </g>
            </svg>
          </div>
        }
      </Measure>
    );
  }
}

export default ScatterplotPCA;
