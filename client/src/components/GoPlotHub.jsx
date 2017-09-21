import React from 'react';
import GoPlot from './GoPlot';
import { getRandomInt } from './Helper'

class GoPlotHub extends React.Component {
	render() {
		// DEBUG GOPlots
		let goPlotData = [];
		for (let i = 0; i < 200; i++) { goPlotData.push(getRandomInt(0, 500)) }

		return(
			<div>
				<GoPlot
					width={150}
					height={10}
					data={goPlotData}
				/>
			</div>
		);
	}
}

export default GoPlotHub;