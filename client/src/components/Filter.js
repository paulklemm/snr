import DimensionTypes from './DimensionTypes';

class Filter {
  constructor(broadcastFilter) {
    this.operator = {
      '<': 'smaller',
      '>': 'larger',
      '<=': 'smallerThan',
      '>=': 'largerThan',
      '=': 'equals',
    };
    this.filter = {};
    // broadcastFilter function from DatasetHub
    this.broadcastFilter = broadcastFilter;
  }

  _filterIsValid(name, val) {
    // Get type from the static object
    const type = DimensionTypes[name];
    const isValid = type === 'number' ? !isNaN(val) : true;
    return isValid;
  }

  _parseFilterValue(name, val) {
    return DimensionTypes[name] === 'number' ? parseFloat(val) : val;
  }

  _getFilterKey(dimension, operator) {
    return dimension + this.operator[operator];
  }

  _addFilter(dimension, val, operator) {
    const filterKey = this._getFilterKey(dimension, operator);
    this.filter[filterKey] = {
      name: dimension,
      value: val,
      operator,
    };
  }

  /**
   * Get the filter of a specific dimension as array
   * @param {String} dimension: Dimension name to derive filter for
   * @return {Array} Array of filter objects
   */
  getFilterOfDimension(dimension) {
    const filter = [];
    for (const filterKey in this.filter) {
      if (this.filter[filterKey].name === dimension) {
        filter.push(this.filter[filterKey]);
      }
    }
    return filter;
  }

  /**
   * Remove all given dimensions and then broadcast to datasets.
   * @param {string} dimensions Rest of dimension to remove
   */
  removeFilters(...dimensions) {
    dimensions.forEach(dimension => this.removeFilter(dimension, false));
    this.broadcastFilter();
  }

  /**
   * Remove filter for dimension
   * @param {String} dimension Dimension to remove the filter for
   * @param  {boolean} broadcastFilter Broadcast filter to all datasets
   */
  removeFilter(dimension, broadcastFilter = true) {
    console.log(`Broadcast: Remove filter for dimension ${dimension}`);
    for (const filterKey in this.filter) { if (this.filter[filterKey].name === dimension) delete this.filter[filterKey]; }
    if (broadcastFilter) {
      this.broadcastFilter();
    }
  }

  /**
   * Remove filter for dimension with specific dimension
   * @param {String} dimension: Dimension to remove the filter for
   * @param {String} operator: Operator to remove
   */
  removeFilterWithOperator(dimension, operator) {
    console.log(`Broadcast: Remove filter with op for dimension ${dimension}`);
    const filterKey = this._getFilterKey(dimension, operator);
    delete this.filter[filterKey];
    this.broadcastFilter();
  }

  /**
   * Get filter object
   * @return {Object} Filter.
   */
  getFilter() {
    return this.filter;
  }

  /**
   * Filter does actually filter
   * @return {boolean} Filter filters filtery filtering
   */
  doesFilter() {
    return Object.keys(this.filter).length !== 0;
  }

  /**
   * Set a number of filters at once and broadcast filter when done
   * @param {Object} filters Any number of filter Objects containing of `name`, `val` and `operator`
   */
  setFilters(...filters) {
    console.log(filters);
    filters.forEach((filter) => {
      console.log(`Set Filter ${filter.name}, ${filter.val}, ${filter.operator}`);
      this.setFilter(filter.name, filter.val, filter.operator, false, false);
    });
    this.broadcastFilter();
  }

  /**
   * Filter function usable by elements that provide a filter for data. If `val` is not a valid input, e.g. it is empty, the filter will be reset.
   * @param  {String} name: Dimension name to be filtered
   * @param  {Object} val: Filter value can be anything depending on the dimension type
   * @param  {Object} operator: Filter operator, either `=`, `<` or `>`. Strings should always use `=`
   * @param  {boolean} verbose Get name and value of filter
   * @param  {boolean} broadcastFilter Broadcast filter to all datasets
   */
  setFilter(name, val, operator, verbose = true, broadcastFilter = true) {
    if (verbose) console.log(`Set filter ${val} for ${name}`);
    const val_filter = this._parseFilterValue(name, val);
    if (this._filterIsValid(name, val_filter)) {
      this._addFilter(name, val, operator);
    } else {
      // Delete the filter
      this.removeFilterWithOperator(name, operator);
    }
    if (broadcastFilter) {
      this.broadcastFilter();
    }
  }
}

export default Filter;
