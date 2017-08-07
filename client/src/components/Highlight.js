class Highlight {
  /**
   * Handle groups of data entries that need to be highlighted separately
   * @param {String} idName Name of the unique Id for each data entry
   */
  constructor(idName) {
    // Groups to highlight in the various view
    this.groups = {};
    this.idName = idName;
  }

  /**
	 * Removes the existing set of highlighted entries and adds the given ones
	 * @param {String} name of the highlight group
	 * @param {Array} datapoints belonging to the highlight group
	 */
  push(name, datapoints) {
    this.groups[name] = [];
    // Iterate over all data points and add only the Id
    for (let point in datapoints)
      this.groups[name].push(datapoints[point][this.idName]);
  }

	/**
	 * Remove all highlight groups
	 */
  clear() {
    this.groups = {};
  }
}

export default Highlight;