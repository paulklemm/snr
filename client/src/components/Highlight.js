import { isUndefined } from './Helper';

class Highlight {
  /**
   * Handle groups of data entries that need to be highlighted separately
   * @param {string} idName Name of the unique Id for each data entry
   * @param {function} forceUpdateApp Update function of App.js
   */
  constructor(idName, forceUpdateApp) {
    // Groups to highlight in the various view
    this.groups = {};
    this.idName = idName;
    this.forceUpdateApp = forceUpdateApp;
  }

  /**
   * Removes the existing set of highlighted entries and adds the given ones
   * @param {String} name of the highlight group
   * @param {Array} datapoints belonging to the highlight group
   */
  push(name, datapoints) {
    this.groups[name] = [];
    // Iterate over all data points and add only the Id
    datapoints.forEach((point) => {
      // Make sure point is not undefined and push it to the list
      if (!isUndefined(point)) {
        this.groups[name].push(point[this.idName]);
      }
    });
    this.forceUpdateApp();
  }

  /**
   * Remove all highlight groups
   */
  clear() {
    this.groups = {};
  }
}

export default Highlight;
