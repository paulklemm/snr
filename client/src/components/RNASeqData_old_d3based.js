import { csv } from 'd3-request';

// Default Mapping for NCD/HFD data set
const columnsNameMappingDefault = {
  // pValue: 'p_value_log2',
  pValue: 'p_value',
  qValue: 'q_value',
  name: 'gene_short_name',
  fc: 'log2(fold_change)',
  biotype: 'gene_biotype',
};
const dataType = {
  pValue: 'float',
  qValue: 'float',
  name: 'string',
  fc: 'float',
  biotype: 'string',
};

class RNASeqData {
  constructor(path, columnsNameMapping, name, debug = false) {
    this.path = path;
    this.name = name;
    this.debug = debug;
    if (this.debug) console.log(`Reading RNASeq data ${path}`);
    // Set columnsmapping to default if default is specified, otherwise set it as the object it is
    columnsNameMapping === 'default'
      ? (this.columnsNameMapping = columnsNameMappingDefault)
      : (this.columnsNameMapping = columnsNameMapping);
    this.readPromise = this.read();
  }

  /**
   * Read the provided RNASeq data using D3 `csv` function and returning a promise of the read.
   * If the read is successfull, the data will be stored in `data` member
   * @return {Promise} fulfilling after csv read is done
   */
  read() {
    if (this.debug) console.time('Loading and processing RNASeq Data');
    const readPromise = new Promise((resolve, reject) => {
      csv(this.path, (error, data) => {
        if (error) {
          reject(error);
        }
        data = this.removeUnusedColumnsAndFixDataTypes(data);
        if (this.debug) console.timeEnd('Loading and processing RNASeq Data');
        this.data = data;
        resolve();
      });
    });
    return readPromise;
  }

  /**
   * For efficiency reasons, two things are put here into one place for creating the data set:
   *   1. Removing columns that are not requred, only ones that are in the mapping settings
   *   2. Put variables into the proper format, e.g. converting strings to floats "123.456" => 123.456
   * @param  {Object} result from D3 `csv`
   * @return {Object} processed result from D3 `csv`
   */
  removeUnusedColumnsAndFixDataTypes(data) {
    const dataTidy = [];
    // Get the array of valid columns so that we only have to define it in the constructor
    const columnNames = Object.keys(this.columnsNameMapping);
    // Iterate over all genes and add only required information to the new data frame
    for (const i in data) {
      // Empty entry that will now be populated
      const entry = {};
      // Iterate over the column names and add the values
      for (const j in columnNames) {
        // Get the value - e.g. columnName: 'pValue' => value = data[i][columnsNameMapping.pValue]
        const value = data[i][this.columnsNameMapping[columnNames[j]]];
        // Check if data type conversion is required
        if (dataType[columnNames[j]] === 'float')
          // e.g. entry.pValue = parseFloat(value)
          { entry[columnNames[j]] = parseFloat(value); } else {
          // e.g. entry.pValue = value
          entry[columnNames[j]] = value;
        }
      }
      dataTidy.push(entry);
    }
    return dataTidy;
  }
}

export default RNASeqData;
