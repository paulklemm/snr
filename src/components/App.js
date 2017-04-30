import React from 'react';
import './App.css';
// eslint-disable-next-line
import BarChart from './BarChart';
// eslint-disable-next-line
import Scatterplot from './Scatterplot';
// eslint-disable-next-line
import Helper from './Helper';
// eslint-disable-next-line
import Hexplot from './Hexplot';
// eslint-disable-next-line
import Piechart from './Piechart';
// eslint-disable-next-line
import DynamicHexBin from './DynamicHexBin';
// eslint-disable-next-line
import ScatterplotRNASeqData from './ScatterplotRNASeqData';
// eslint-disable-next-line
import RNASeqData from './RNASeqData';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// <Scatterplot width={200} height={200} data={data} settings={{'x': {'variableName': 'sepalWidth', 'label': 'Sepal Width (cm)'}, 'y': {'variableName': 'sepalLength', 'label': 'Sepal Length (cm)'}}}/>
// <Scatterplot width={600} height={600} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 60000, milliseconds: 8000}} />
// <BarChart width={300} height={300} />
// <div className="App-header">
// 					<img src={logo} className="App-logo" alt="logo" />
// 					<h2>Welcome to React</h2>
// 				</div>
// <Scatterplot width={200} height={200} data={Helper.createDummyDataScatterplot(200)} settings={Helper.createDummySettingsScatterplot()}/>
// 				<Scatterplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()}/>
// 				<Scatterplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 100, milliseconds: 500}} />
// <DynamicHexBin />
class App extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	componentWillMount() {
		let rnaSeqData = new RNASeqData('./data/ncd_hfd_small.csv', 'default', 'default data set', ()=>{
		// let rnaSeqData = new RNASeqData('./data/ncd_hfd.csv', 'default', 'default data set', ()=>{
			this.setState({
				rnaSeqData: rnaSeqData
			});
		});
		this.state = {
			rnaSeqData: rnaSeqData
		};
	}

	// TODO Fix stres test
	render() {
		return (
			<MuiThemeProvider>
				<div className="App">
					{ /* <BarChart width={200} height={200} /> */ }
					{ /* <Scatterplot width={200} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" /> */ }
					{ /* <ScatterplotRNASeqData width={200} height={200} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" /> */ }
					{ /* <ScatterplotRNASeqData width={600} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" /> */ }
					{ /* <Hexplot width={600} height={400} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" hexSize={10} hexMax={10} /> */ }
				{ /* <Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/> */ }
					<Hexplot width={300} height={200} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={10} hexMax={10} />
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
