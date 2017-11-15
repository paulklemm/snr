import Filter from './Filter';
import DatasetIcons from './DatasetIcons';
import { isUndefined } from './Helper';

class DatasetHub {
  constructor(filterBroadcasted, stateSetBiomartVariables) {
    this.datasets = {};
    this.names = [];
    this.enabled = {};
    this.loading = {};
    this.broadcastFilter = this.broadcastFilter.bind(this);
    this.getDatasetIcon = this.getDatasetIcon.bind(this);
    this.setBiomartVariableSelection = this.setBiomartVariableSelection.bind(this);
    this.metadata = {};
    // Biomart variables as key and selection status as value
    this.biomartVariables = {};
    // Init filter object and inject broadcastFilter function
    this.filter = new Filter(this.broadcastFilter);
    // filterTriggered function from App.js
    this.filterBroadcasted = filterBroadcasted;
    // setBiomartVaribales from App.js
    this.stateSetBiomartVariables = stateSetBiomartVariables;
  }

  /**
   * Set list of available biomart variables
   * 
   * @param {array} biomartVariables Biomart variables
   */
  setBiomartVariables(biomartVariables) {
    const initValues = ['ensembl_gene_id', 'start_position', 'end_position'];
    // Init empty biomartVariables object
    this.biomartVariables = {};
    // Initialize all biomart variables
    biomartVariables.forEach((variable) => {
      this.biomartVariables[variable] = initValues.indexOf(variable) !== -1;
    });
    // Update App.js state
    this.stateSetBiomartVariables(this.biomartVariables)
  }

  /**
   * Set selection status of biomart variable
   * 
   * @param {string} biomartVariable Biomart variable
   * @param {boolean} selectStatus Selection status
   */
  setBiomartVariableSelection(biomartVariable, selectStatus) {
    this.biomartVariables[biomartVariable] = selectStatus;
    // Update App.js state
    this.stateSetBiomartVariables(this.biomartVariables)
    console.log(
      `Set select status of ${biomartVariable} to ${this.biomartVariables[biomartVariable]}`,
    );
  }

  /**
   * Get available biomart variablres
   * @return {array} biomart variables
   */
  getBiomartVariables() {
    // return Object.keys(this.biomartVariables);
    return this.biomartVariables;
  }

  /**
   * Get metadata for dataset
   * @param {string} name Dataset name
   * @return {array} Metadata array
   */
  getMetadata(name) {
    return Object.keys(this.metadata).indexOf(name) === -1 ? undefined : this.metadata[name];
  }

  /**
   * Set metadata for datataset
   * @param {string} name Dataset name
   * @param {array} metadata Metadata array
   */
  setMetadata(name, metadata) {
    this.metadata[name] = metadata;
  }

  /**
   * Get loaded state of dataset
   * @param {string} dataset Name
   * @return {boolean} Loaded state
   */
  isLoaded(dataset) {
    return this.datasetExists(dataset) ? this.datasets[dataset].loaded : false;
  }

  /**
   * Check if dataset exists in dataset hub
   * @param {String} dataset Dataset name
   * @return {boolean} Dataset exists
   */
  datasetExists(dataset) {
    return !isUndefined(this.datasets[dataset]);
  }

  /**
   * Get loading state of dataset
   * @param {string} dataset Name
   * @return {boolean} Loading state
   */
  isLoading(dataset) {
    return this.datasetExists(dataset) ? this.datasets[dataset].loading : false;
  }

  /**
   * Get enabled state of dataset
   * @param {string} dataset Name
   * @return {boolean} Enabled state
   */
  isEnabled(dataset) {
    return this.datasets[dataset].enabled;
  }

  /**
   * Get the count of enabled datasets in Hub.
   * @return {Integer} Enabled dataset count
   */
  getEnabledDatasetsCount() {
    let count = 0;
    for (const dataset in this.enabled) if (this.enabled[dataset] === true) count += 1;
    return count;
  }

  /**
   * Propagate the current filter to all datasets
   */
  broadcastFilter() {
    for (const i in this.names) {
      const name = this.names[i];
      const dataset = this.datasets[name];
      // Only apply filter if the data set is really loaded
      if (dataset.loaded) this.datasets[name].setFilter(this.filter.getFilter());
    }
    // Call triggered function to run follow-up tasks
    this.filterBroadcasted();
  }

  push(dataset) {
    this.datasets[dataset.name] = dataset;
    this.update();
  }

  /**
   * Get dataset icon
   * @param {string} datasetName Name of the dataset to retreive
   */
  getDatasetIcon(datasetName) {
    if (Object.keys(this.datasets).indexOf(datasetName) === -1) {
      throw new Error(
        `Could not get icon for ${datasetName}, dataset does not exist in DatasetHub`,
      );
    } else return this.datasets[datasetName].icon;
  }

  /**
   * Set icon of dataset
   * @param {String} datasetName
   * @param {String} icon name, get icon from DatasetIcons
   */
  setDatasetIcon(datasetName, icon) {
    this.datasets[datasetName].icon = icon;
  }

  /**
   * Get number of private datasets
   * @return {integer} Private dataset count
   */
  getCountPrivateDatasets() {
    let count = 0;
    const datasetNames = Object.keys(this.datasets);
    datasetNames.forEach((name) => {
      if (!this.datasets[name].isPublic) {
        count += 1;
      }
    });
    return count;
  }

  /**
   * Give default icon to dataset based on the total dataset count
   * @param {string} name Name of dataset to set icon for
   */
  setDatasetIconDefault(name) {
    // If dataset is public, give it the default archive icon
    if (this.datasets[name].isPublic) {
      this.setDatasetIcon(name, 'archive');
      return;
    }
    const datasetIconNames = Object.keys(DatasetIcons);
    let datasetCount = this.getCountPrivateDatasets();
    // Decrement datasetCount by 1 if it is not 0
    datasetCount = datasetCount === 0 ? datasetCount : datasetCount - 1;
    this.setDatasetIcon(name, datasetIconNames[datasetCount]);
  }

  setData(name, data, dimNames) {
    this.datasets[name].setData(data, dimNames);
    // 'Loading' changes, so update
    this.update();
  }

  setLoading(name) {
    this.datasets[name].loading = true;
    this.update();
  }

  setEnable(datasetName, enabled) {
    this.datasets[datasetName].enabled = enabled;
    this.update();
    return this.datasets[datasetName].loaded === false && enabled;
  }

  update() {
    const names = Object.keys(this.datasets);
    const enabled = {};
    const loading = {};
    // Iterate over all data sets and update information
    names.forEach((name) => {
      const dataset = this.datasets[name];
      enabled[name] = dataset.enabled;
      loading[name] = dataset.loading;
      // Set dataset icon
      if (dataset.icon === '') {
        this.setDatasetIconDefault(name);
      }
    });
    this.names = names;
    this.enabled = enabled;
    this.loading = loading;
  }
}

export default DatasetHub;
