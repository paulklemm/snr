import React from 'react';
import GoPlot from './GoPlot';
import { isUndefined } from './Helper';
import { max } from 'd3-array';

class GoPlotHub extends React.Component {

	/**
	 * Filter GO-terms based on size and number of plots
	 * 
	 * @param {array} goTerms List of goTerm objects
	 * @param {integer} minGoSize Minimum count of genes for GO-term
	 * @param {integer} maxPlots Maximum number of plotted GO-terms 
	 * @return {array} Filtered list of goTerms
	 */
	filter(goTerms, minGoSize, maxPlots) {
		let filteredGoTerms = [];
		// Iterate over GO terms and check if they satisfy the criteria
		for (const goTerm of goTerms) {
			// Check for minimum size
			if (goTerm['ids'].length < minGoSize)
				continue
			// Push the new goTerm
			filteredGoTerms.push(goTerm);
			// If the size exceeds maxPlots, break the for loop
			if (filteredGoTerms.length >= maxPlots)
				break;
		}
		// Set the global variable
		return filteredGoTerms;
	}

	/**
	 * Determine the largest 'ids' array in a set of GO-terms
	 * Format:
	 * [1]:Object {ids: Array(36), percentage: 18, goId: "GO:0090049"}
	 * [2]:Object {ids: Array(38), percentage: 12.666666666666666, goId: "GO:0050816"}
	 * [3]:Object {ids: Array(38), percentage: 12.666666666666666, goId: "GO:1990452"}
	 * [4]:Object {ids: Array(37), percentage: 12.333333333333334, goId: "GO:1903378"}
	 * 
	 * @param {array} goTerms Array of goTerms to determin max size for
	 * @return {integer} Size of largest go-Term in the array
	 */
	getMaxGoTermSize(goTerms) {
		const goTermsSizes = [];
		goTerms.forEach(goTerm => {
			goTermsSizes.push(goTerm['ids'].length);
		});
		return max(goTermsSizes);
	}

	/**
	 * Retrieve array of GoPlots based on input GO terms
	 * @return {Array} Array of GoPlot elements
	 */
	getGoPlots() {
		if (isUndefined(this.props.goTerms))
			return [];

		// Filter the GO-plots
		const maxPlots = 10;
		const minGoSize = 10;
		const filteredGoTerms = this.filter(this.props.goTerms, minGoSize, maxPlots);
		console.log(filteredGoTerms);
		// Get the maximum GO size in the filtered GO terms
		const maxGoTermSize = this.getMaxGoTermSize(filteredGoTerms);
		console.log(`maxGoTermSize: ${maxGoTermSize}`);
		// Iterate over goTerm elements
		// Restrict to 10 plots
		let goPlots = [];
		for (const goTerm of filteredGoTerms) {
			const newGoPlot =
				<GoPlot
					height={10}
					dataset={this.props.dataset}
					goTerm={goTerm}
					dimension={"fc"}
					maxGeneCount={maxGoTermSize}
					maxWidth={150}
					key={`Dataset ${this.props.dataset.name}, GoID ${goTerm.goId}`}
				/>;

			goPlots.push(newGoPlot);
		}
		return goPlots;
	}

	render() {
		let toRender;
		// 
		if (isUndefined(this.props.goTermHub)) {
			toRender = <div>GO-Term Hub not initialized</div>
		}	else {
			toRender = 
				<div>
					{this.getGoPlots()}
					{isUndefined(this.props.goTerms) ? 'No GO Terms provided' : 'Yes, GO Terms provided'}
				</div>;
		}
		return(toRender);
	}
}

export default GoPlotHub;