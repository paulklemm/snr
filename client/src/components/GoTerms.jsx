class GoTerms {
	constructor(getGoSummary, getGoPerGene) {
		this.summary = {};
		this.geneToGo = {};
		// Define the Methods from other Objects
		this.nodeBridgeGetGoSummary = getGoSummary;
		this.nodeBridgeGetGoPerGene = getGoPerGene;
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
			// Add empty genes array that will be filled when we get the geneToGo values
			summaryDict[element.go_id]['genes'] = [];
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
		let summary = await this._getSummary(this.nodeBridgeGetGoSummary(ensemblDataset, ensemblVersion))
		this.summary = await this.addWithEnsemblAndVersion(this.summary, summary, ensemblDataset, ensemblVersion);
		console.log(this.summary);
	}

	/**
	 * Attach value to a dictionary consisting of ensembl dataset and version
	 * 
	 * @param {Object} dict Already existing dictionary
	 * @param {Object} value Value to add
	 * @param {String} ensemblDataset Ensembl dataset to add the value to
	 * @param {String} ensemblVersion Ensembl version to add the value to
	 * @return {Object} Updated dictionary
	 */
	async addWithEnsemblAndVersion(dict, value, ensemblDataset, ensemblVersion) {
		if (!(ensemblDataset in Object.keys(dict)))
			dict[ensemblDataset] = {};
		if (!(ensemblVersion in Object.keys(dict[ensemblDataset])))
			dict[ensemblDataset][ensemblVersion] = {};
		dict[ensemblDataset][ensemblVersion] = value;
		return dict;
	}

	/**
	 * Add GO terms as object mapping Gene-IDs to GO-term ids
	 * 
	 * @param {String} ensemblDataset Ensembl dataset
	 * @param {String} ensemblVersion Ensembl version ('release')
	 */
	async addGeneToGo(ensemblDataset, ensemblVersion) {
		const goPerGene = await this.nodeBridgeGetGoPerGene(ensemblDataset, ensemblVersion);
		let newGeneToGo = {};
		// Make dictionary pointing gene IDs to GO-terms
		goPerGene['go']['.val'].map((elem) => {
			if (elem['go_id'] === '')
				return;
			// Create a new array to store the GO-terms in
			if (typeof newGeneToGo[elem['ensembl_gene_id']] === 'undefined')
				newGeneToGo[elem['ensembl_gene_id']] = [];
			// Add GO-term to the dictionary
			newGeneToGo[elem['ensembl_gene_id']].push(elem['go_id']);
			// Push the gene to the GO-term summary
			this.summary[ensemblDataset][ensemblVersion][elem['go_id']]['genes'].push(elem['ensembl_gene_id']);
		});
		this.geneToGo = await this.addWithEnsemblAndVersion(this.geneToGo, newGeneToGo, ensemblDataset, ensemblVersion);
		console.log(this.geneToGo);
	}

	/**
	 * 
	 * @param {Array} ensemblIDs EnsemblIDs to get GO-Terms for
	 * @param {String} ensemblDataset Ensembl dataset
	 * @param {String} ensemblVersion Ensembl version ('release')
	 * @return {Object} Dictionary relating Ensembl gene ids to GO-Terms 
	 */
	getGoTerms(ensemblIDs, ensemblDataset = 'mmusculus_gene_ensembl', ensemblVersion = 'current') {
		let goTerms = {};
		ensemblIDs.forEach(ensemblID => {
			const goTermPerGene = this.geneToGo[ensemblDataset][ensemblVersion][ensemblID];
			if (typeof goTerms !== 'undefined')
				goTerms[ensemblID] = goTermPerGene;
		});
		return goTerms;
	}
}

export default GoTerms;