import React from 'react';
import Measure from 'react-measure';
import Scatterplot from './Scatterplot';
import { isUndefined, objectValueToArray } from './Helper';

class ScatterplotPCA extends Scatterplot {
  constructor(props) {
    super(props);
    this.updateWithNewProps(props);
  }

  /**
   * Check if object props are valid
   * @param {Object} nextProps Props object to check
   * @return {boolean} Props validity
   */
  propsAreValid(nextProps) {
    // When PCA object is not defined, return false
    if (isUndefined(nextProps.pca)) { return false; }
    // Get dimensions from PCA and return success state
    return (this.getDimensionsFromPca(nextProps.pca));
  }

  getDimensionsFromPca(pca) {
    // PCA to scatterplot dimensions
    const x = objectValueToArray(pca, 'PC1');
    const y = objectValueToArray(pca, 'PC2');
    if (x.length <= 0 || y.length <= 0 || x.length !== y.length) { return false; }
    // Remove the last element. It contains the dimensions of the PCA
    this.varianceExplainedX = x.pop();
    this.varianceExplainedY = y.pop();
    this.x = x;
    this.y = y;
    return true;
  }

  /**
   * Update component state with newly received props
   * @param {Object} nextProps React props element of object
   */
  updateWithNewProps(nextProps) {
    if (!this.propsAreValid(nextProps)) { return; }
    this.setScale(this.x, this.y);
    this.axes = this.renderAxes();
    this.dots = this.renderDots(3, this.x, this.y);
    // Add axis labels rounded to two digits after comma
    this.axisLabels = this.renderAxisLabels(
      `${nextProps.xLabel} (${Math.round(this.varianceExplainedX * 10000) / 100}%)`,
      `${nextProps.yLabel} (${Math.round(this.varianceExplainedY * 10000) / 100}%)`
    );
  }

  componentWillReceiveProps(nextProps) {
    this.updateWithNewProps(nextProps);
  }

  render() {
    if (!this.propsAreValid(this.props)) {
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
          (<div ref={measureRef}>
            <svg
              className="scatterplot"
              onMouseDown={e => this.handleMouseDown(e)}
              onMouseMove={e => this.handleMouseMove(e)}
              onMouseUp={e => this.handleMouseUp(e)}
              width={this.widthNoMargin + this.margin.left + this.margin.right}
              height={this.heightNoMargin + this.margin.top + this.margin.bottom}
            >
              <g transform={`translate(${this.margin.left},${this.margin.top})`}>
                {this.axes}
                {this.dots}
                {this.axisLabels}
                {this.state.tooltip}
                {this.state.selectionRectangle.getRectangle()}
              </g>
            </svg>
          </div>)
        }
      </Measure>
    );
  }
}

export default ScatterplotPCA;
