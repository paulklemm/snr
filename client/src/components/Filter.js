import DimensionTypes from './DimensionTypes';

class Filter {
  constructor (broadcastFilter) {
    this.operator = {
      "<": 'smaller',
      ">": 'larger',
      "<=": 'smallerThan',
      ">=": 'largerThan',
      "=": 'equals'
    };
    this.filter = {};
    this.broadcastFilter = broadcastFilter;
  }

  _filterIsValid(name, val) {
    // Get type from the static object
    const type = DimensionTypes[name];
    let isValid = (type === "number") ? !isNaN(val) : true;
    return isValid;
  }

  _parseFilterValue(name, val) {
    return (DimensionTypes[name] === "number") ? parseFloat(val) : val;
  }

  _getFilterKey(dimension, operator) {
    return (dimension + this.operator[operator]);
  }

  _addFilter(dimension, val, operator) {
    const filterKey = this._getFilterKey(dimension, operator);
    this.filter[filterKey] = { name: dimension, value: val, operator: operator };
  }

  /**
   * Remove filter for dimension
   * @param {String} dimension Dimension to remove the filter for
   */
  removeFilter(dimension) {
    for (const filterKey in this.filter)
      if (this.filter[filterKey].name == dimension)
        delete this.filter[filterKey];
    this.broadcastFilter();
  }

  /**
   * Remove filter for dimension with specific dimension
   * @param {String} dimension: Dimension to remove the filter for
   * @param {String} operator: Operator to remove
   */
  removeFilterWithOperator(dimension, operator) {
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
	 * Filter function usable by elements that provide a filter for data. If `val` is not a valid input, e.g. it is empty, the filter will be reset.
	 * @param  {String} name: Dimension name to be filtered
	 * @param  {Object} val: Filter value can be anything depending on the dimension type
	 * @param  {Object} operator: Filter operator, either `=`, `<` or `>`. Strings should always use `=`
	 * @param  {Bool} verbose Get name and value of filter
	 */
  setFilter(name, val, operator, verbose = true) {
    if (verbose) console.log(`Set filter ${val} for ${name}`);
    const val_filter = this._parseFilterValue(name, val);
    if (this._filterIsValid(name, val_filter)) {
      this._addFilter(name, val, operator);
    } else {
      // Delete the filter
      this.removeFilterWithOperator(name, operator);
    }
    this.broadcastFilter();
  }
}

export default Filter;