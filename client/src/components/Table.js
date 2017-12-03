import React from 'react';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';
import { DefaultFilterSetting, DimensionTypes } from './DimensionTypes.js';
import { isUndefined, areIdentical, Stopwatch } from './Helper';

const styleSheet = {
  headerTR: {
    borderBottom: '2px solid #ee6351',
    backgroundColor: '#f2f2f2',
  },
  headerTH: {
    textAlign: 'left',
    height: 63,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  headerTHFiltered: {
    textAlign: 'left',
    height: 63,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#fdecea',
  },
  th: {
    textAlign: 'left',
    height: 10,
    fontWeight: 'normal',
    overflow: 'hidden',
  },
  table: {
    borderCollapse: 'collapse',
    fontSize: '10px',
    width: '100%',
    tableLayout: 'fixed',
  },
};

// https://www.youtube.com/watch?v=Bx5JB2FcSnk
// https://jsfiddle.net/vjeux/KbWJ2/9/
class Table extends React.Component {
  constructor(props) {
    super(props);
    this.debug = false;
    // Somehow the height of the TH elements differ from the max-height. Therfore we have to update this as soon as the list is rendered the first time
    this.rowHeight = styleSheet.th.height;
    // We store the textFieldValues of the filter as class attribute since we need it when the operator changes
    this.textFieldValues = {};
    const filterSetting = isUndefined(props.dimNames)
      ? undefined
      : this.getDefaultFilterSettings(props.dimNames);
    const inputTimeLimit = 500;
    this.state = {
      rowTop: 0,
      rowBottom: 40,
      filterSetting,
      inputTimeLimit, // Input time limit in milliseconds
      lastInputStopwatch: new Stopwatch(inputTimeLimit), // When was filter manipulated last
    };
  }

  componentWillReceiveProps(nextProps) {
    // If dimNames is undefined, do nothing
    if (isUndefined(nextProps.dimNames)) {
      return;
    }
    // Check if dimnames match. If they do not match, we need to reset the filterSettingsState
    const dimNamesMismatch = isUndefined(this.props.dimNames)
      ? true
      : !areIdentical(this.props.dimNames, nextProps.dimNames);

    if (dimNamesMismatch || isUndefined(this.state.filterSetting)) {
      const filterSetting = this.getDefaultFilterSettings(nextProps.dimNames);
      this.setState({ filterSetting });
    }
  }

  /** Since the FPKM value names differ, they need to be derived from the dimension names
   * @param {Array} dimNames Array of dimension names
   */
  getDefaultFilterSettings(dimNames) {
    const filterSetting = DefaultFilterSetting;
    // Iterate through the values and look for FPKM values
    for (const i in dimNames) {
      const dim = dimNames[i];
      // Check if the dim name contains FPKM and if so, add the FPKM settings
      if (/FPKM/i.test(dim)) {
        filterSetting[dim] = filterSetting.FPKM;
      }
    }
    return filterSetting;
  }

  delayedFilter(dimension, stopWatch, immediate = false, debug = true) {
    // If immediate is true, don't care about all the stopWatch Jazz
    if (immediate) {
      this.applyFilter(dimension);
    }
    // Get Stopwatch either from state or from stopWatch function variable
    const _stopWatch = isUndefined(stopWatch) ? this.state.lastInputStopwatch : stopWatch;
    setTimeout(() => {
      if (debug) {
        console.log(`Get Time: ${_stopWatch.getTimeDifference()}`);
        console.log(`SetTimeout is overLimit: ${_stopWatch.overLimit()}`);
      }
      // Get the time from the stopwatch triggered by the last input
      // If this stopwatch does not show more than the minimum limit
      // then there must have been a additional input since then and therefore we will
      // discard this filter
      if (!this.state.lastInputStopwatch.overLimit()) {
      } else {
        // Apply the filter
        this.applyFilter(dimension);
      }
    }, _stopWatch.limit);
  }

  /**
   * Apply the text-input filter on the dimension
   * @param {string} dimension Dimension to apply filter on
   * @param {string} value Value for filter. If set blank we will get it from this.textfieldValuies
   */
  applyFilter(dimension, value) {
    const filterValue = isUndefined(value) ? this.textFieldValues[dimension] : value;
    // Apply the filter
    // Scroll back to the top of the list
    this.refs.scrollable.scrollTop = 0;
    // Remove all filters of this dimension
    this.props.filter.removeFilter(dimension);
    this.props.filter.setFilter(dimension, filterValue, this.state.filterSetting[dimension]);
    // Remove the value from the local array feeding the text fields when filter is not applied yet
    this.textFieldValues[dimension] = '';
    // Update the app
    this.props.forceUpdateApp();
  }

  /**
   * Sets the new x dimension for the hexplots in the main app
   * @param {String} dimension: New dimension for hexplots in main app
   */
  onHeaderClick(dimension) {
    this.props.changePlotDimension(dimension);
  }

  constructTableHeader() {
    // let dimensions = Object.keys(DimensionTypes);
    const dimensions = this.props.dimNames;
    // Add header table
    const header = [];
    dimensions.forEach((dimension, index) => {
      // Check if there are filter available for the current dimension and set filter value accordingly
      const filter = this.props.filter.getFilterOfDimension(dimension);
      // Default filter value is an empty string
      let filterValue = '';
      // We only need to update the filter value when there is exactly one filter set for the current dimension
      // Otherwise we will simply set the filterValue to `''`
      if (filter.length === 1) {
        // Update filterValue to proper value
        filterValue = filter[0].value;
        // Update Operator if necessary
        const filterSetting = this.state.filterSetting;
        if (filterSetting[dimension] !== filter[0].operator) {
          filterSetting[dimension] = filter[0].operator;
          this.setState({ filterSetting });
        }
      }

      header.push(
        <th key={`header-th-${index}`}>
          <div style={filter.length > 0 ? styleSheet.headerTHFiltered : styleSheet.headerTH}>
            <div
              onClick={(event) => {
                event.preventDefault();
                this.onHeaderClick(dimension);
              }}
            >
              {/* <Typography noWrap type="body1"><Icon name="sort-desc" style={{fontSize:'100%'}} /> {dimension}</Typography> */}
              {dimension}
            </div>
            <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
              <IconButton
                style={{ marginTop: '-2px', width: '10px' }}
                onClick={(event) => {
                  // Update filter
                  const currentOperator = event.target.textContent;
                  const filterSetting = this.state.filterSetting;
                  // Get dimension type
                  const dimensionType = DimensionTypes[dimension];
                  // If dimensiontype is string, do nothing
                  if (dimensionType === 'string') {
                    return;
                  }
                  // Switch signs
                  if (currentOperator === '=') {
                    filterSetting[dimension] = '>';
                  } else if (currentOperator === '>') {
                    filterSetting[dimension] = '<';
                  } else if (currentOperator === '<') {
                    filterSetting[dimension] = '=';
                  }
                  // Apply the filtersettings
                  this.setState({ filterSetting });
                  // Apply the filter immediately and get value from the filter object
                  this.applyFilter(
                    dimension,
                    this.props.filter.getFilterOfDimension(dimension)[0].value,
                  );
                }}
              >
                {this.state.filterSetting[dimension]}
              </IconButton>
              <TextField
                style={{ width: '100% important!', marginLeft: '5px' }}
                id="filter"
                label="Filter"
                type="search"
                value={
                  this.state.lastInputStopwatch.overLimit()
                    ? filterValue
                    : this.textFieldValues[dimension]
                }
                onChange={(event) => {
                  console.log(`Table Input Event, value: ${event.target.value}`);
                  // Reset input stopwatch
                  const stopWatch = new Stopwatch(this.state.inputTimeLimit);
                  // Set new Stopwatch
                  this.setState({ lastInputStopwatch: stopWatch });
                  // Update the textfieldValue object with the newly changed value
                  this.textFieldValues[dimension] = event.target.value;
                  // Pass the stopwatch to handleFilter, because state might not be set in time
                  // for handleFilter to act on it
                  this.delayedFilter(dimension, stopWatch);
                }}
              />
            </div>
          </div>
        </th>,
      );
    });
    return (
      <table style={styleSheet.table}>
        <tbody>
          <tr key="header-tr" style={styleSheet.headerTR}>
            {header}
          </tr>
        </tbody>
      </table>
    );
  }

  constructTableDynamic() {
    // let dimensions = Object.keys(DimensionTypes);
    const dimensions = this.props.dimNames;
    const table = [];
    // Iterate over the top and bottom element
    for (let i = this.state.rowTop; i <= this.state.rowBottom; i++) {
      // Avoid rendering empty rows (can happen in small lists or filters yielding empty lists)
      if (i > this.props.data.length - 1) break;
      // Initialize an empty row element
      const row = [];
      // Iterate through all dimensions (columns) in the data
      let dimensionKey = '';
      for (const j in dimensions) {
        const dimension = dimensions[j];
        dimensionKey += this.props.data[i][dimension];
        // row.push(<th key={`row_${i}${j}`}><div style={styleSheet.th}>{this.props.data[i][dimension]}</div></th>);
        row.push(
          <th key={`row_${this.props.data[i][dimension]}-${i}-${j}`}>
            <div style={styleSheet.th}>
              {/* <Typography type="body1"> */}
              {this.props.data[i][dimension]}
              {/* </Typography> */}
            </div>
          </th>,
        );
      }
      // Push the columns as new row to the table
      const evenClass = i % 2 === 0 ? 'odd' : '';
      // Push the new table entry as well as the onClick events
      table.push(
        <tr
          key={`tr_${dimensionKey}_${i}`}
          className={evenClass}
          onMouseEnter={() => {
            this.props.highlight.push('selection', [this.props.data[i]]);
            this.props.forceUpdateApp();
          }}
          onMouseLeave={() => {
            this.props.highlight.clear();
            this.props.forceUpdateApp();
          }}
        >
          {row}
        </tr>,
      );
    }
    // The top spacer must not exceed the maximum length of the table minus the visible table window
    let topSpacerHeight =
      this.state.rowBottom < this.props.data.length
        ? this.state.rowTop * this.rowHeight
        : (this.props.data.length - 1 - (this.state.rowBottom - this.state.rowTop)) *
          this.rowHeight;
    // When the elements do not fill the entire height the spacer height would get negative. Fix this by setting it to 0
    if (topSpacerHeight < 0) topSpacerHeight = 0;
    const topSpacer = [<div key={'topSpacer'} style={{ height: topSpacerHeight }} />];
    // Bottom spacer is set to 0 when the bottom end is reached
    const bottomSpacerHeight =
      this.state.rowBottom < this.props.data.length - 1
        ? (this.props.data.length - (this.state.rowBottom + 2)) * this.rowHeight
        : 0;
    const bottomSpacer =
      bottomSpacerHeight === 0
        ? []
        : [<div key={'bottomSpacer'} style={{ height: bottomSpacerHeight }} />];

    if (this.debug) {
      console.log('------------------------');
      console.log(
        `Data length: ${this.props.data.length}, Topmost element:${
          this.state.rowTop
        }, Bottom element: ${this.state.rowBottom}, Bottom spacer height: ${
          bottomSpacerHeight
        }, Top spacer height: ${topSpacerHeight}`,
      );
    }

    return (
      <div>
        {topSpacer}
        <table style={styleSheet.table}>
          <tbody
            ref={(body) => {
              this.tableBody = body;
            }}
          >
            {/* {this.constructTableHeader(dimensions)} */}
            {table}
          </tbody>
        </table>
        {bottomSpacer}
      </div>
    );
  }

  renderRequired(newRowTop, newRowBottom) {
    // Prevent overflowing list
    // if (this.state.rowBottom >= this.props.data.length - 1 && newRowBottom >= this.props.data.length - 1)
    //   return false;
    // Only return true when the visible cells differ
    if (newRowTop === this.state.rowTop && newRowBottom === this.state.rowBottom) return false;
    return true;
  }

  setScrollState() {
    const rowTop = Math.floor(this.refs.scrollable.scrollTop / this.rowHeight);
    const rowBottom = Math.floor(
      (this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / this.rowHeight,
    );
    // Only change state if re-rendering is required
    if (this.renderRequired(rowTop, rowBottom)) {
      this.setState({
        rowTop,
        rowBottom,
      });
    }
  }

  render() {
    if (isUndefined(this.props.data) || isUndefined(this.state.filterSetting)) {
      return <div />;
    }
    // Update the default height of the row to have precise calculations on the table and not rely on the style sheet
    if (this.tableBody !== undefined && this.tableBody.children[0] !== undefined) {
      this.rowHeight = this.tableBody.children[0].clientHeight;
    }
    if (this.debug) console.log(`Set rowHeight to ${this.rowHeight}`);
    return (
      <div>
        <div>
          <p>{`Rendering ${this.props.data.length} rows`}</p>
        </div>
        {this.constructTableHeader()}
        <div
          ref="scrollable"
          style={{
            height: this.props.height,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
          onScroll={() => {
            this.setScrollState();
          }}
        >
          {this.constructTableDynamic()}
        </div>
      </div>
    );
  }
}

Table.propTypes = {
  data: PropTypes.array,
  dimNames: PropTypes.array,
  height: PropTypes.number,
  filter: PropTypes.object,
  changePlotDimension: PropTypes.func,
};
export default Table;
