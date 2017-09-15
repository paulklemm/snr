class GoTerms {
	constructor(getGoSummary, toGo) {
		this.summary = {};
		// Define the Methods from other Objects
		this.nodeBridgeGetGoSummary = getGoSummary;
		this.nodeBridgeTogo = toGo;
	}

	/**
	 * Helper function: Process the GO summary promise and create dictionary based on go-term id
	 * @param {Promise} summaryPromise of NodeBridge query
	 * @return {Object} Dictionary assigning GO-term summary to go-id
	 */
	async _getSummary(summaryPromise) {
		const summary = await summaryPromise;
		// Create dictionary for go term based on its id
		let summaryDict = {};
		summary['go']['.val'].forEach((element) => {
			// Reference element by go-id
			summaryDict[element.go_id] = element;
		});
		return summaryDict;
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
		this.summary[ensemblDataset][ensemblVersion] = await this._getSummary(this.nodeBridgeGetGoSummary(ensemblDataset, ensemblVersion))
		console.log(this.summary);
	}

	/**
	 * Returns GO-Terms associated with identifiers
	 * 
	 * @param {array} identifier Array of identifier to relate to go-terms (e.g. ["ENSMUSG00000064370", "ENSMUSG00000065947"])
	 * @param {String} ensemblDataset Biomart dataset
	 * @param {String} ensemblVersion Ensembl version ('release')
	 */
	async toGo(identifier, ensemblDataset, ensemblVersion) {
		const response = await this.nodeBridgeTogo(identifier, ensemblDataset, ensemblVersion);
		const goTermsPerIdentifier = response['go']['.val'];
		return goTermsPerIdentifier;
	}
}

export default GoTerms;