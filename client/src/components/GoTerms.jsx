class GoTerms {
	constructor(getGoSummary) {
		this.summary = {};
		this.getGoSummary = getGoSummary;
	}

	/**
	 * Get GO summary for ensembl dataset and release and add it to GoTersm.summary
	 * 
	 * @param {String} ensemblDataset Ensembl dataset to query GO term summary from
	 * @param {String} ensemblVersion Ensembl version/release
	 */
	async addSummary(ensemblDataset, ensemblVersion) {
		if (!(ensemblDataset in Object.keys(this.summary)))
			this.summary[ensemblDataset] = {};
		if (!(ensemblVersion in Object.keys(this.summary[ensemblDataset])))
			this.summary[ensemblDataset][ensemblVersion] = {};
		this.summary[ensemblDataset][ensemblVersion] = this.getSummary(this.getGoSummary(ensemblDataset, ensemblVersion))
		console.log(this.summary);
	}

	/**
	 * Helper function: Process the GO summary promise and create dictionary based on go-term id
	 * @param {Promise} summaryPromise of NodeBridge query
	 * @return {Object} Dictionary assigning GO-term summary to go-id
	 */
	async getSummary(summaryPromise) {
		const summary = await summaryPromise;
		// Create dictionary for go term based on its id
		let summaryDict = {};
		summary['go']['.val'].forEach((element) => {
			// Reference element by go-id
			summaryDict[element.go_id] = element;
		});
		return summaryDict;
	}
}

export default GoTerms;