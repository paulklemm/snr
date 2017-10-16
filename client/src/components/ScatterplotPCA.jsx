import React from 'react';
import Measure from 'react-measure';
// Material UI
import Scatterplot from './Scatterplot';
import { isUndefined, objectValueToArray, injectStyle } from './Helper';
import DatasetIcons from './DatasetIcons';

const styleSheet = {
  datasetLoaded: {
    color: '#EE6351'
  },
  datasetLoading: {
    color: 'red',
    animation: 'pulse 1s infinite ease-in-out'
  }
};

const pulse = `
  @keyframes pulse {
    0% { color: #001F3F; }
    50% { color: #EE6351; }
    100% { color: #001F3F; }
  }
`;

injectStyle(pulse);

class ScatterplotPCA extends Scatterplot {
  constructor(props) {
    super(props);
    // Collection holding the width and height of each icon to allow for exact positioning
    this.iconSize = {};
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
    return (this.getDimensionsFromPca(nextProps.pca, nextProps));
  }

  /**
   * Extract dimensions from the PCA
   * @param {Array} pca Array with PCA object information
   * @return {boolean} PCA data is valid
   */
  getDimensionsFromPca(pca, props) {
    // PCA to scatterplot dimensions
    const x = objectValueToArray(pca, `PC${props.xPc}`);
    const y = objectValueToArray(pca, `PC${props.yPc}`);
    const rowNames = objectValueToArray(pca, '_row');
    if (x.length <= 0 || y.length <= 0 || x.length !== y.length) { return false; }
    // Get the images from PCA object
    const icons = [];
    pca.forEach((item) => {
      if (item._row !== 'proportion_of_variance') {
        try {
          const icon = props.datasetHub.getDatasetIcon(item._row);
          icons.push(icon);
        } catch (error) { console.log(`${item._row} not yet defined`); }
      }
    });
    // Remove the last element. It contains the dimensions of the PCA
    if (pca[x.length - 1]._row !== 'proportion_of_variance') { return false; }
    // Get variance explained
    this.varianceExplainedX = x.pop();
    this.varianceExplainedY = y.pop();
    // Row names
    rowNames.pop();
    this.rowNames = rowNames;
    // Set dimensions to class members
    this.x = x;
    this.y = y;
    // Set icons array
    this.icons = icons;
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
      `PC${nextProps.xPc} (${Math.round(this.varianceExplainedX * 10000) / 100}%)`,
      `PC${nextProps.yPc} (${Math.round(this.varianceExplainedY * 10000) / 100}%)`
    );
  }

  /**
   * Create array of SVG circle elements based on the input array
   * @param {Integer} radius: Radius of the circles
   * @param {Array} x: Array of values for x
   * @param {Array} y: Array of values for y
   * @param {Array} filtered: Array of boolean values indicating whether the element is filtered or not
   * @param {Object} hightlight: Highlight object consisting of minX, maxX, minY, maxY defining circles to highlight
   * @return {Array} Circle objects as array
   */
  renderDots(radius, x, y, filtered = [], highlight = undefined) {
    // Keep track of the number of elements where one variable shows NaN
    this.numberOfNaN = { x: 0, y: 0 };
    let dots = [];
    for (let i in x) {
      const currentX = x[i];
      const currentY = y[i];
      const currentRowName = this.rowNames[i];
      // Check whether the current element is filtered or not
      const currentIsFiltered = (isUndefined(filtered[i])) ? false : filtered[i];
      // Only create dot if x and y are numbers
      if (isNaN(currentX) || isNaN(currentY))
        continue;
      // Check if we have to highlight the elements
      const cx = this.xScale(currentX);
      const cy = this.yScale(currentY);
      let newRadius = (!isUndefined(highlight) && cx >= highlight.minX && cx <= highlight.maxX && cy >= highlight.minY && cy <= highlight.maxY) ? radius + 1 : radius;
      // Get style for the element
      let divStyle = styleSheet.myPulse;
      if (this.props.datasetHub.isLoaded(currentRowName)) {
        divStyle = styleSheet.datasetLoaded;
      } else if (this.props.datasetHub.isLoading(currentRowName)) {
        divStyle = styleSheet.datasetLoading;
      }

      if (this.icons.length > 0) {
        dots.push(
          <g
            onMouseEnter={() => this.showTooltip(currentX, currentY, currentRowName)}
            onMouseLeave={() => this.hideTooltip()}
            onClick={() => this.props.toggleEnabledDataset(currentRowName)}
            key={`${currentX},${currentY},${i}`}
          >
            <foreignObject
              width="20"
              height="20"
              x={
                isUndefined(this.iconSize[currentRowName]) ?
                cx - 8 : cx - (this.iconSize[currentRowName].width / 2)
              }
              y={
                isUndefined(this.iconSize[currentRowName]) ?
                cy - 8 : cy - (this.iconSize[currentRowName].height / 2)
              }
            >
                <div
                  style={divStyle}
                >
                  <Measure
                    bounds
                    onMeasure={(measure) => {
                      this.iconSize[currentRowName] = {
                        width: measure.width,
                        height: measure.height
                      };
                      console.log(`${currentRowName}: ${this.iconSize[currentRowName].width}, ${this.iconSize[currentRowName].height}`);
                    }}
                  >
                  {DatasetIcons[this.icons[i]]}
                  </Measure>
                </div>
            </foreignObject>
          </g>
        );
      }
    }
    return dots;
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.setState({ tooltip: [] });
  }

  /**
   * Show tooltip with information about the data set
   * @param {float} x Tooltip position coordinate
   * @param {float} y Tooltip position coordinate
   * @param {string} name Dataset name
   */
  showTooltip(x, y, name) {
    let tooltip = [];
    let dx = this.xScale(x) + 5;
    let dy = this.yScale(y) + 5;
    tooltip.push(
      <text x={dx} y={dy} key={`Tooltip: ${dx}, ${dy}, ${name}`}>
        {name}
      </text>
    );
    this.setState({ tooltip });
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
