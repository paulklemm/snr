import React from 'react';
import './App.css';
// eslint-disable-next-line
import BarChart from './BarChart';
import Scatterplot from './Scatterplot';
import Helper from './Helper';
// eslint-disable-next-line
import Hexplot from './Hexplot';
// eslint-disable-next-line
import Piechart from './Piechart';
// eslint-disable-next-line
import DynamicHexBin from './DynamicHexBin';
import RNASeqData from './RNASeqData';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

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
			this.setState({
				rnaSeqData: rnaSeqData
			});
		});
		this.state = {
			rnaSeqData: rnaSeqData
		};
	}

	render() {
		return (
			<MuiThemeProvider>
				<div className="App">
					<BarChart width={200} height={200} />
					{ /* <Hexplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 100, milliseconds: 2000}} hexSize={10} hexMax={10} /> */}
					<Scatterplot width={600} height={400} data={this.state.rnaSeqData} settings={{ x: 'pValue', y: 'fc' }}/>
					<Scatterplot width={400} height={200} data={Helper.getIrisNewFormat()} settings={{ x: 'sepalWidth', y: 'sepalLength' }}/>
					{ /* <Scatterplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 100, milliseconds: 2000}} /> */ }
					<Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
