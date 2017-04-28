import {csv} from 'd3-request';

// Default Mapping for NCD/HFD data set
const columnsNameMappingDefault = {
	pValue: 'p_value',
	qValue: 'q_value',
	name: 'gene_short_name',
	fc: 'log2(fold_change)',
	biotype: 'gene_biotype'
};
const dataType = {
	pValue: 'float',
	qValue: 'float',
	name: 'string',
	fc: 'float',
	biotype: 'string'
}
class RNASeqData {
	constructor(path, columnsNameMapping, name, callbackSuccess) {
		console.log(`Reading RNASeq data ${path}`);
		this.path = path;
		this.error = false;
		this.loading = true;
		this.name = name;
		// Set columnsmapping to default if default is specified, otherwise set it as the object it is
		columnsNameMapping === 'default' ? this.columnsNameMapping = columnsNameMappingDefault : this.columnsNameMapping = columnsNameMapping;
		this.read(callbackSuccess);
	}

	read(callbackSuccess){
		console.time('Loading and processing RNASeq Data');
		csv(this.path, (error, data) => {
			if (error) {
				this.error = true;
			}
			this.data = this.removeUnusedColumnsAndFixDataTypes(data);
			this.loading = false;
			console.timeEnd('Loading and processing RNASeq Data');
			// console.log(this.data.columns);
			// console.log(this.data);
			callbackSuccess(this.data);
		})
	}

	// For efficiency reasons, two things are put here into one place for creating the data set:
	// 1. Removing columns that are not requred, only ones that are in the mapping settings
	// 2. Put variables into the proper format, e.g. converting strings to floats "123.456" => 123.456
	removeUnusedColumnsAndFixDataTypes(data) {
		let dataTidy = [];
		// Get the array of valid columns so that we only have to define it in the constructor
		let columnNames = Object.keys(this.columnsNameMapping);
		// Iterate over all genes and add only required information to the new data frame
		for (let i in data) {
			// Empty entry that will now be populated
			let entry = {};
			// Iterate over the column names and add the values
			for (let j in columnNames) {
				// Get the value - e.g. columnName: 'pValue' => value = data[i][columnsNameMapping.pValue]
				let value = data[i][this.columnsNameMapping[columnNames[j]]]
				// Check if data type conversion is required
				if (dataType[columnNames[j]] == 'float')
					// e.g. entry.pValue = parseFloat(value)
					entry[columnNames[j]] = parseFloat(value);
				else {
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