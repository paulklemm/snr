import DimensionTypes from './DimensionTypes';
import { isUndefined } from './Helper';

class Dataset {
  constructor(name, enabled = false) {
    this.name = name;
    this.enabled = enabled;
    this.loaded = false;
    this.loading = false;
    this.dimNames = [];
    // TODO: Derive this from metadata!
    this.ensemblDataset = 'mmusculus_gene_ensembl';
    this.ensemblVersion = 'current';
    // HTML Element representing the dataset icon
    this.icon = '';
  }

  /**
   * Get array of Dimension names
   * @return {array} Dimension names as strings
   */
  getDimensionNames() {
    return this.dimNames;
  }

  /**
   * Set dataset content
   *
   * @param {Array} data Array of datapoints
   * @param {Array} dimNames Names of the dimensions
   */
  setData(data, dimNames) {
    // Keep a copy of the data and the filtered data for fast access
    this.data = data;
    this.dataFiltered = data;
    // A flag that is set when a new filter is applied. It will trigger the
    // dataFiltered object to be updated when it is accessed
    this.filterDataRequired = false;
    this.loaded = true;
    this.loading = false;
    this.dimNames = dimNames;
    // Attach 'filtered' element
    this.filtered = [];
    for (const i in this.data) this.filtered[i] = false;

    // Setup collection associating id of each entry with row-id for fast access
    this.ensemblToArrayIndex = this._updateEnsemblToArrayIndex(this.data);
    // Keep a copy of the unfiltered one
    this.ensemblToArrayIndexUnfiltered = { ...this.ensemblToArrayIndex };
  }

  /**
   * Get collection mapping row id to index in the array
   *
   * @param {Boolean} wholeData Return indexing collection for whole data or apply filtered data
   * @return {Object} Collection mapping row id to index in the array
   */
  _getEnsemblToArrayIndex(wholeData = false) {
    return wholeData ? this.ensemblToArrayIndexUnfiltered : this.ensemblToArrayIndex;
  }

  /**
   * Gives O(1) access to data entry or row based on EnsemblID
   *
   * @param {String} id EnsemblID of data row
   * @param {String} dimension Entry of row to return
   * @return {Object} Entry
   */
  getEntry(id, dimension) {
    // Get index data array position
    const dataPosition = this._getEnsemblToArrayIndex(true)[id];
    // if dimension is defined, return only the dimension
    if (!isUndefined(dimension)) {
      return isUndefined(this.data[dataPosition]) ? undefined : this.data[dataPosition][dimension];
    }
    // If dimension is undefined, return the whole row
    return isUndefined(this.data[dataPosition]) ? undefined : this.data[dataPosition];
  }

  /**
   * Get collection mapping row id to index in the array
   *
   * @param {Array} data data to create the collection for
   * @return {Object} Collection mapping row id to index in the array
   */
  _updateEnsemblToArrayIndex(data) {
    const ensemblToArrayIndex = {};
    // Iterate over all entries in the data and create the index
    for (const rowIndex in data) { ensemblToArrayIndex[data[rowIndex].EnsemblID] = parseInt(rowIndex, 10); }

    return ensemblToArrayIndex;
  }

  /**
   * Get array of the data set.
   *
   * @param {Boolean} wholeData: Defaults to false. If set to true, will return the whole data set even if it is filtered
   * @return {Array} Data points as array
   */
  getData(wholeData = false, transformation = 'linear') {
    // Apply filter to data if required
    if (!wholeData && this.filterDataRequired) {
      this._applyFilterToData();
      this.filterDataRequired = false;
    }

    // Since the dataFiltered is data when there is no filter applied, we can
    // return based on the wholeData variable
    return wholeData ? this.data : this.dataFiltered;
  }

  /**
   * Apply the filters to the dataset
   */
  _applyFilterToData() {
    // If the data is not filtered, the filtered dataset is equal to the the normal one
    if (!this.isFiltered()) {
      this.dataFiltered = this.data;
      this.ensemblToArrayIndex = this.ensemblToArrayIndexUnfiltered;
      return;
    }

    // If the data is filtered, apply the filter
    const dataFiltered = [];
    for (const i in this.data) if (!this.filtered[i]) dataFiltered.push(this.data[i]);

    // Update element-ID to array index
    this.ensemblToArrayIndex = this._updateEnsemblToArrayIndex(dataFiltered);
    this.dataFiltered = dataFiltered;
  }

  /**
   * Apply filter to the dataset. This will fill the `filtered` class member array with boolean values associated with each data point
   * to indicate the filtered status.
   *
   * @param {Object} filter: Filter object in the Format `{name: 'fc', value: '3', operator: '>'}`
   * @param {Boolean} debug: Print out debug statements
   */
  setFilter(filter, debug = true) {
    const filterKeys = Object.keys(filter);
    if (debug) console.log(`Setfilter for ${this.name}`);
    for (const i in this.data) {
      // Init value with 'false' statement
      this.filtered[i] = false;
      for (const j in filterKeys) {
        const filterKey = filterKeys[j];
        const dimName = filter[filterKey].name;
        // Added a dirty check on FPKM value names. Every variable with `FPKM` in it will be classified as number
        if (DimensionTypes[dimName] === 'number' || /FPKM/i.test(dimName)) {
          // Process Numbers
          if (filter[filterKey].operator === '<') {
            if (this.data[i][dimName] >= filter[filterKey].value) this.filtered[i] = true;
          } else if (filter[filterKey].operator === '>') {
            if (this.data[i][dimName] <= filter[filterKey].value) this.filtered[i] = true;
          }
          // Not a number
        } else if (
            typeof this.data[i][dimName] === 'undefined' ||
            this.data[i][dimName].indexOf(filter[filterKey].value) === -1
          ) { this.filtered[i] = true; }
      }
    }
    // Apply the filter to the data to be able to retrieve it fast
    // Set the flag that a new filter is applied, so when the data is queried next time
    // we have to update it. This may be saving some time when the data is not used
    this.filterDataRequired = true;
  }

  /**
   * Check if a filter is applied to the data set.
   *
   * @return {Boolean} `isFiltered` status
   */
  isFiltered() {
    for (const i in this.filtered) if (this.filtered[i] === true) return true;
    return false;
  }
}

export default Dataset;
