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
		console.time('Loading RNASeq Data');
		csv(this.path, (error, data) => {
			if (error) {
				this.error = true;
			}
			this.data = data;
			this.loading = false;
			console.timeEnd('Loading RNASeq Data');
			console.log(this.data.columns);
			console.log(this.data);
			callbackSuccess(this.data);
		})
	}
}

export default RNASeqData;