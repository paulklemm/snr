import React from 'react';
import GoPlot from './GoPlot';
import { isUndefined } from './Helper';
import { max } from 'd3-array';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import TextField from 'material-ui/TextField';

class GoPlotHub extends React.Component {

	constructor() {
		super();
		this.state = {
			drawWholeGO: false,
			numberGoPlots: 10
		};
	}

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
	getMaxGoTermSize(goTerms, arrayMember) {
		const goTermsSizes = [];
		goTerms.forEach(goTerm => {
			goTermsSizes.push(goTerm[arrayMember].length);
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
		const minGoSize = 10;
		const filteredGoTerms = this.filter(this.props.goTerms, minGoSize, this.state.numberGoPlots);
		
		let maxGoTermSize;
		// Get the maximum GO size in the filtered GO terms
		if (this.state.drawWholeGO) {
			// If we want to draw the whole GO-terms, we have to get the summary of all of the filtered GO terms
			let filteredGoTermSummaries = [];
			for (const filteredGoTerm of filteredGoTerms) {
				filteredGoTermSummaries.push(this.props.goTermHub.summary[this.props.dataset.ensemblDataset][this.props.dataset.ensemblVersion][filteredGoTerm['goId']]);
			}
			maxGoTermSize = this.getMaxGoTermSize(Object.values(filteredGoTermSummaries), 'genes');
		} else {
			// Otherwise, just count the filtered ids per GO
			maxGoTermSize = this.getMaxGoTermSize(filteredGoTerms, 'ids');
		}
		
			
		console.log(`maxGoTermSize: ${maxGoTermSize}`);
		// Iterate over goTerm elements
		// Restrict to 10 plots
		let goPlots = [];
		for (const goTerm of filteredGoTerms) {
			const newGoPlot =
				<GoPlot
					height={8}
					dataset={this.props.dataset}
					goTerm={goTerm}
					goTermSummary={this.props.goTermHub.summary[this.props.dataset.ensemblDataset][this.props.dataset.ensemblVersion][goTerm['goId']]}
					dimension={"fc"}
					drawWholeGO={this.state.drawWholeGO}
					maxGeneCount={maxGoTermSize}
					maxWidth={150}
					key={`Dataset ${this.props.dataset.name}, GoID ${goTerm.goId}, wholeGo ${this.state.drawWholeGO}`}
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
					<form className='goplothubform' noValidate autoComplete="off">
						<TextField
							className="goplothubformelement"
							id="numberGoPlots"
							label="#Plots"
							value={this.state.numberGoPlots}
							onChange={e => this.setState({ numberGoPlots: e.target.value })}
							type="number"
							margin="normal"
						/>
						<FormControlLabel
							className="goplothubformelement"
							control={
								<Switch
									checked={this.state.drawWholeGO}
									onChange={(event, checked) => this.setState({ drawWholeGO: checked })}
								/>
							}
							label="Draw whole GO-Term"
						/>
					</form>
					{this.getGoPlots()}
					{isUndefined(this.props.goTerms) ? 'No GO Terms provided' : 'Yes, GO Terms provided'}
				</div>;
		}
		return(toRender);
	}
}

export default GoPlotHub;