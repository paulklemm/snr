import React from 'react';
import GoPlot from './GoPlot';
import { getRandomInt, isUndefined } from './Helper'

class GoPlotHub extends React.Component {

	/**
	 * Retrieve array of GoPlots based on input GO terms
	 * @return {Array} Array of GoPlot elements
	 */
	getGoPlots() {
		if (isUndefined(this.props.goTerms))
			return [];

		// Iterate over goTerm elements
		// Restrict to 10 plots
		const maxPlots = 10;
		let goPlots = [];
		for (const goTerm of this.props.goTerms) {
			// Apply filters here
			if (goTerm['ids'] < 10)
				continue

			const newGoPlot =
				<GoPlot
					width={150}
					height={10}
					dataset={this.props.dataset}
					goTerm={goTerm}
					dimension={"fc"}
					key={`Dataset ${this.props.dataset.name}, GoID ${goTerm.goId}`}
				/>;

			goPlots.push(newGoPlot);
			if (goPlots.length > maxPlots)
				break;
		}
		return goPlots;
	}

	render() {
		return(
			<div>
				{ this.getGoPlots() }
				{isUndefined(this.props.goTerms) ? 'No GO Terms provided' : 'Yes, GO Terms provided'}
			</div>
		);
	}
}

export default GoPlotHub;