import {csv} from 'd3-request';

// Default Mapping for NCD/HFD data set
const columnsNameMappingDefault = {
	pValue: 'p_value',
	qValue: 'q_value',
	name: 'gene_short_name',
	fc: 'log2(fold_change)',
	biotype: 'gene_biotype'
};

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
			this.data = this.removeUnusedColumns(data);
			this.loading = false;
			console.timeEnd('Loading and processing RNASeq Data');
			// console.log(this.data.columns);
			// console.log(this.data);
			callbackSuccess(this.data);
		})
	}

	removeUnusedColumns(data) {
		let dataTidy = [];
		// Get the array of valid columns so that we only have to define it in the constructor
		let columnNames = Object.keys(this.columnsNameMapping);
		// Iterate over all genes and add only required information to the new data frame
		for (let i in data) {
			// Empty entry that will now be populated
			let entry = {};
			// Iterate over the column names and add the values
			for (let j in columnNames) {
				// e.g. entry.pValue = data[i][columnsNameMapping.pValue]
				entry[columnNames[j]] = data[i][this.columnsNameMapping[columnNames[j]]];
			}
			dataTidy.push(entry);
		}
		return dataTidy;
	}
}

export default RNASeqData;