import { isUndefined, objectValueToArray } from './Helper';
import { max } from 'd3-array';

class GoTermHub {
	constructor(getGoSummary, getGoPerGene) {
		this.summary = {};
		this.geneToGo = {};
		this.maxGeneCount = 0;
		// Define the Methods from other Objects
		this.nodeBridgeGetGoSummary = getGoSummary;
		this.nodeBridgeGetGoPerGene = getGoPerGene;
	}

	/**
	 * Get the maximum size of GO-terms
	 * 
	 * @param {object} summary Collection named by GO-id
	 * @return {integer} Number of genes in the largest GO-term
	 */
	getMaximumGoTermSize(summary) {
		// Convert the summary to an array
		const goSizes = objectValueToArray(Object.values(summary), 'count_genes');
		return max(goSizes);
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
		// Check local storage, as we might not have to download the files every time
		// const localStorageKey = `Sonar 'summary' Ens: ${ensemblDataset}, Ver: ${ensemblVersion}`;
		// const localStorageGeneToGo = localStorage.getItem(localStorageKey);
		// if (localStorageGeneToGo !== null) {
		// 	this.summary = JSON.parse(localStorageGeneToGo);
		// 	return;
		// }

		// If it could not be retreived locally, download it form the server and add it to the localStorage
		let summary = await this._getSummary(this.nodeBridgeGetGoSummary(ensemblDataset, ensemblVersion))
		this.summary = await this.addWithEnsemblAndVersion(this.summary, summary, ensemblDataset, ensemblVersion);
		console.log(this.summary);
		// Count the maximum GO-Term size
		this.maxGeneCount = this.getMaximumGoTermSize(this.summary[ensemblDataset][ensemblVersion]);
		// Add to localstorage
		// localStorage.setItem(localStorageKey, JSON.stringify(this.summary));
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
		// Check local storage, as we might not have to download the files every time
		// const localStorageKey = `Sonar 'gene to go' Ens: ${ensemblDataset}, Ver: ${ensemblVersion}`;
		// const localStorageGeneToGo = localStorage.getItem(localStorageKey);
		// if (localStorageGeneToGo !== null) {
		// 	this.geneToGo = JSON.parse(localStorageGeneToGo);
		// 	return;
		// }

		// If local storage retrieval fails, proceed
		const goPerGene = await this.nodeBridgeGetGoPerGene(ensemblDataset, ensemblVersion);
		let newGeneToGo = {};
		// Make dictionary pointing gene IDs to GO-terms
		goPerGene['go']['.val'].forEach((elem) => {
			if (elem['go_id'] === '')
				return;
			// Create a new array to store the GO-terms in
			if (isUndefined(newGeneToGo[elem['ensembl_gene_id']]))
				newGeneToGo[elem['ensembl_gene_id']] = [];
			// Add GO-term to the dictionary
			newGeneToGo[elem['ensembl_gene_id']].push(elem['go_id']);
			// Push the gene to the GO-term summary
			this.summary[ensemblDataset][ensemblVersion][elem['go_id']]['genes'].push(elem['ensembl_gene_id']);
		});
		this.geneToGo = await this.addWithEnsemblAndVersion(this.geneToGo, newGeneToGo, ensemblDataset, ensemblVersion);
		// Save the result to localstorage
		// localStorage.setItem(localStorageKey, JSON.stringify(this.geneToGo));
	}

	/**
	 * Array of GO-IDs of the provided Ensembl-IDs
	 * 
	 * @param {Array} ensemblIDs EnsemblIDs to get GO-Terms for
	 * @param {String} ensemblDataset Ensembl dataset
	 * @param {String} ensemblVersion Ensembl version ('release')
	 * @return {Array} Array of GO-terms
	 */
	getGoTerms(ensemblIDs, ensemblDataset = 'mmusculus_gene_ensembl', ensemblVersion = 'current') {
		// Initialize dictionary pointing GO-terms to the provided ensembl-IDs
		let goTerms = {};
		// Iterate over all ensembl ids
		ensemblIDs.forEach(ensemblID => {
			// Get all GO-Terms the gene is associated with
			const goTermsOfGene = this.geneToGo[ensemblDataset][ensemblVersion][ensemblID];
			// When the gene is not associated with GO terms, do nothing
			if (isUndefined(goTermsOfGene))
				return;
			// Iterate over all GO-terms the gene is associated with and add it to goTerms object
			goTermsOfGene.forEach(goTerm => {
				// When GO-term is not in the dictionary, initialize it
				if (isUndefined(goTerms[goTerm])) {
					goTerms[goTerm] = {};
					goTerms[goTerm]['ids'] = [];
				}
				// Push the GO-term
				goTerms[goTerm]['ids'].push(ensemblID);
			});
		});
		// Iterate again over all goTerms and calculate the percentage of elements in the GO-terms
		Object.keys(goTerms).forEach( goTermKey => {
			goTerms[goTermKey]['percentage'] = goTerms[goTermKey]['ids'].length / this.summary[ensemblDataset][ensemblVersion][goTermKey]['count_genes'];
		});

		// Convert the collection to an array
		let goTermsArray = [];
		// Iterate over all GO-Terms and add them to the array
		Object.keys(goTerms).forEach(goTermKey => {
			let newEntry = goTerms[goTermKey];
			// To still know which goTerm we have, keep the ID
			newEntry['goId'] = goTermKey;
			goTermsArray.push(newEntry);
		});

		return goTermsArray;
	}

	/**
	 * Sort GO-terms, currently only by percentage
	 * 
	 * @param {Object} goTerms 
	 */
	sortGoTerms(goTerms) {
		// Sort it
		goTerms = goTerms.sort((a, b) => b['percentage'] - a['percentage']);
		return goTerms;
	}
}

export default GoTermHub;