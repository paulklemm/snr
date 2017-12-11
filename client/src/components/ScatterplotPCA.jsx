import React from 'react';
import Measure from 'react-measure';
import Scatterplot from './Scatterplot';
import { isUndefined, objectValueToArray, injectStyle } from './Helper';
import DatasetIcons from './DatasetIcons';
import Loading from './Loading';
import DatasetInfo from './DatasetInfo';
import PCAReloadButton from './PCAReloadButton';

const styleSheet = {
  datasetLoaded: {
    color: '#EE6351',
  },
  datasetLoading: {
    color: 'red',
    animation: 'pulse 1s infinite ease-in-out',
  },
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
  }

  /**
   * Check if object props are valid
   * @param {Object} nextProps Props object to check
   * @return {boolean} Props validity
   */
  propsAreValid(nextProps) {
    // When PCA object is not defined, return false
    if (isUndefined(nextProps.pca)) {
      return false;
    }
    // Get dimensions from PCA and return success state
    return this.getDimensionsFromPca(nextProps.pca, nextProps);
  }

  /**
   * Extract dimensions from the PCA
   * @param {Array} pca Array with PCA object information
   * @return {boolean} PCA data is valid
   */
  getDimensionsFromPca(pca, props) {
    // PCA to scatterplot dimensions
    let x = objectValueToArray(pca, `PC${props.xPc}`);
    let y = objectValueToArray(pca, `PC${props.yPc}`);
    // Convert x and y to arrays of floats
    const toFloat = array => array.map(value => parseFloat(value));
    x = toFloat(x);
    y = toFloat(y);
    const rowNames = objectValueToArray(pca, '_row');
    if (x.length <= 0 || y.length <= 0 || x.length !== y.length) {
      return false;
    }
    // Get the images from PCA object
    const icons = [];
    pca.forEach((item) => {
      if (item._row !== 'proportion_of_variance') {
        try {
          const icon = props.datasetHub.getDatasetIcon(item._row);
          icons.push(icon);
        } catch (error) {
          icons.push('archive');
        }
      }
    });
    // Remove the last element. It contains the dimensions of the PCA
    if (pca[x.length - 1]._row !== 'proportion_of_variance') {
      return false;
    }
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
    const dots = [];
    for (const i in x) {
      const currentX = x[i];
      const currentY = y[i];
      const currentRowName = this.rowNames[i];
      // Check whether the current element is filtered or not
      // const currentIsFiltered = isUndefined(filtered[i]) ? false : filtered[i];
      // Only create dot if x and y are numbers
      if (isNaN(currentX) || isNaN(currentY)) continue;
      // Check if we have to highlight the elements
      const cx = this.xScale(currentX);
      const cy = this.yScale(currentY);
      // const newRadius =
      //   !isUndefined(highlight) &&
      //   cx >= highlight.minX &&
      //   cx <= highlight.maxX &&
      //   cy >= highlight.minY &&
      //   cy <= highlight.maxY
      //     ? radius + 1
      //     : radius;
      // Get style for the element
      let divStyle = styleSheet.myPulse;
      if (this.props.datasetHub.isLoaded(currentRowName)) {
        divStyle = styleSheet.datasetLoaded;
      } else if (this.props.datasetHub.isLoading(currentRowName)) {
        divStyle = styleSheet.datasetLoading;
      }

      if (this.icons.length > 0) {
        // Dirty check if the current icon is a public dataset
        // TODO: Make this proper by pulling the dataset from the hub and get information from there
        const isPublic = this.icons[i] === 'archive';
        const iconOpacity = isPublic ? 0.1 : 1;
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
              style={{ opacity: iconOpacity }}
              x={
                isUndefined(this.iconSize[currentRowName])
                  ? cx - 8
                  : cx - this.iconSize[currentRowName].width / 2
              }
              y={
                isUndefined(this.iconSize[currentRowName])
                  ? cy - 8
                  : cy - this.iconSize[currentRowName].height / 2
              }
            >
              <div style={divStyle}>
                <Measure
                  bounds
                  onMeasure={(measure) => {
                    this.iconSize[currentRowName] = {
                      width: measure.width,
                      height: measure.height,
                    };
                  }}
                >
                  {DatasetIcons[this.icons[i]]}
                </Measure>
              </div>
            </foreignObject>
          </g>,
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
    const tooltip = [];
    const dx = this.xScale(x) + 5;
    const dy = this.yScale(y) + 5;
    const metadata = this.props.getMetadataPromise(name);
    tooltip.push(
      <foreignObject width="1" height="1" x={dx} y={dy} key={`Tooltip: ${dx}, ${dy}, ${name}`}>
        <DatasetInfo metadata={metadata} name={name} />
      </foreignObject>,
      // <text x={dx} y={dy} key={`Tooltip: ${dx}, ${dy}, ${name}`}>
      //   {name}
      // </text>
    );
    this.setState({ tooltip });
  }

  render() {
    if (!this.propsAreValid(this.props)) {
      return <Loading label="Loading Overview" />;
    }
    // reset margin and scale in case they changed
    this.setMargin();
    // SetScale is dependant on the width and height, therefore it belongs to render
    this.setScale(this.x, this.y);

    return (
      <Measure
        bounds
        key={`ScatterplotPCA ${this.state.responsiveWidth}, ${this.state.responsiveHeight}`}
        onMeasure={(measure) => {
          if (measure.width !== this.state.responsiveWidth) {
            this.setState({ responsiveWidth: measure.width });
          }
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef}>
            <span
              style={{
                fontSize: 15,
                position: 'absolute',
                marginLeft: this.widthNoMargin,
                marginTop: 20,
              }}
            >
              <PCAReloadButton
                primaryDataset={this.props.primaryDataset}
                pcaLoading={this.props.pcaLoading}
                pcaEnsemblIds={this.props.pcaEnsemblIds}
                getPCA={this.props.getPCA}
              />
            </span>
            <svg
              className="scatterplot"
              style={{ overflow: 'visible' }}
              width={this.widthNoMargin + this.margin.left + this.margin.right}
              height={this.heightNoMargin + this.margin.top + this.margin.bottom}
            >
              <g transform={`translate(${this.margin.left},${this.margin.top})`}>
                {this.renderAxes()}
                {this.renderDots(3, this.x, this.y)}
                {this.renderAxisLabels(
                  `PC${this.props.xPc} (${Math.round(this.varianceExplainedX * 10000) / 100}%)`,
                  `PC${this.props.yPc} (${Math.round(this.varianceExplainedY * 10000) / 100}%)`,
                )}
                {this.state.tooltip}
                {this.state.selectionRectangle.getRectangle()}
              </g>
            </svg>
          </div>
        )}
      </Measure>
    );
  }
}

export default ScatterplotPCA;
