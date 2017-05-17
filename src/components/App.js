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
import OpenCPUBridge from './OpenCPUBridge';
import Dataset from './Dataset';
import DatasetHub from './DatasetHub';
// eslint-disable-next-line
import R from './R';
import DatasetSelect from './DatasetSelect';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Navbar from './Navbar';

const styleSheet = {
	appBody: {
		marginLeft: 10,
		marginRight: 10
	}
};

class App extends React.Component {
	constructor() {
		super();
		this.setEnableDataset = this.setEnableDataset.bind(this);
		this.state = {
			datasets: {},
			datasetEnabled: {}
		};
		// let datasetHub = new DatasetHub();
		// this.state = {datasetHub: datasetHub};
	}

	setEnableDataset(name, enabled) {
		let datasetEnabled = {...this.state.datasetEnabled};
		datasetEnabled[name] = enabled;
		this.setState({
			datasetEnabled: datasetEnabled
		});
	}

	componentWillMount() {
		// Debug RNASeq connection
		let openCPU = new OpenCPUBridge('http://localhost:8004');
		// let r = new R(openCPU);
		openCPU.runRCommand("sonaR", "get_data_names", { x: "x0f2853db6b"}, 'json', false).then(output => {
			console.log(output);
			let datasets = {...this.state.datasets};
			let datasetEnabled = {...this.state.datasetEnabled};
			// let datasetHub = {...this.state.dataHub};
			for (let i in output['.val']) {
				let datasetName = output['.val'][i];
				// datasetHub.push(new Dataset(datasetName));
				datasets[datasetName] = new Dataset(datasetName);
				// Default add value to data set, this should later be derived from firebase
				datasetEnabled[datasetName] = false;
			}
			this.setState({
				// datasetHub: datasetHub
				datasets: datasets,
				datasetNames: Object.keys(datasets),
				datasetEnabled: datasetEnabled
			});
			console.log(this.state.datasetHub.names);

			openCPU.runRCommand("sonaR", "get_dataset", { datasets: "x0f2853db6b", name: `'${this.state.rnaSeqDatasetNames[0]}'`}, 'json', true).then(response => {
				console.log(`get ${this.state.rnaSeqDatasetNames[0]}`);
				console.log(response);
			});
		});
		// let rnaSeqData = {};
		// let promises = [];
		// rnaSeqData.default = new RNASeqData('./data/dieterich-pipeline_ncd_hfd.csv', 'default', 'default data set');
		// // rnaSeqData.dbdb_ncd = new RNASeqData('./data/dieterich-pipeline_dbdb_ncd.csv', 'default', 'dbdb_ncd');
		// // rnaSeqData.insulin_pbs = new RNASeqData('./data/dieterich-pipeline_insulin_pbs.csv', 'default', 'insulin_pbs');
		// // rnaSeqData.ldlr_wt = new RNASeqData('./data/dieterich-pipeline_LDLR_wt.csv', 'default', 'LDLR_wt');
		// // rnaSeqData.misty_dbdb = new RNASeqData('./data/dieterich-pipeline_misty_dbdb.csv', 'default', 'misty_dbdb');
		// for (let i in Object.keys(rnaSeqData)) {
		// 	promises.push(rnaSeqData[Object.keys(rnaSeqData)[i]].readPromise);
		// }
		// Promise.all(promises).then(() => {
		// 	console.log(`${new Date().toLocaleString()}: All data loaded`);
		// 	let testArray = [];
		// 	testArray.push(Helper.objectValueToArray(rnaSeqData.default.data, 'pValue'));
		// 	testArray.push(Helper.objectValueToArray(rnaSeqData.dbdb_ncd.data, 'pValue'));
		// 	testArray.push(Helper.objectValueToArray(rnaSeqData.insulin_pbs.data, 'pValue'));
		// 	testArray.push(Helper.objectValueToArray(rnaSeqData.ldlr_wt.data, 'pValue'));
		// 	testArray.push(Helper.objectValueToArray(rnaSeqData.misty_dbdb.data, 'pValue'));
		// 	// testArray[0] = testArray[0].slice(0, testArray[0].length - 2);
		// 	// testArray[1] = testArray[1].slice(1, testArray[1].length - 1);
		// 	// console.log(testArray);
		// 	// R.PCA([[6,7,8,9,10],[1,2,3,4,5]]).then(output => {
		// 	// r.PCA(testArray).then(output => {
		// 	// 	console.log(output);
		// 	// });
		// });

			// openCPU.runRCommand("graphics", "hist", { x: Helper.objectValueToArray(rnaSeqData.default.data, 'pValue'), breaks: 10}, 'ascii', false).then(output => {
			openCPU.runRCommand("graphics", "hist", { x: "[1,2,2,2,3,4,5,6,6,7]", breaks: 10}, 'ascii', false).then(output => {
				this.setState({
					image: `${output.graphics[0]}/svg`
				});
				// console.log(output);
			// We have to force the update since react will not recognize on it's own that the state object
			// RNASeqData has changed. https://facebook.github.io/react/docs/react-component.html#forceupdate
			this.forceUpdate();
		});
		// Add the rnaSeqData to the state, but it could probably be also a class member
		// this.state = {
		// 	rnaSeqData: undefined
		// };
	}

	// TODO Fix stres test
	render() {
		return (
			<MuiThemeProvider>
				<div>
					<Navbar />
					<div style={styleSheet.appBody}>
						<Grid container gutter={16}>
							{ /* <BarChart width={200} height={200} /> */ }
							{ /* <Scatterplot width={200} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" /> */ }
							{ /* <ScatterplotRNASeqData width={200} height={200} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" /> */ }
							{ /* <ScatterplotRNASeqData width={600} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" /> */ }
							{ /* <Hexplot width={600} height={400} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" hexSize={10} hexMax={10} /> */ }
							{ /* <Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/> */ }
							{ /* <Hexplot width={500} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={10} hexMax={10} /> */ }
							<Grid item xs>
								<Paper>
									<DatasetSelect datasetEnabled={ this.state.datasetEnabled } setEnableDataset={ this.setEnableDataset }/>
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									<img src={`${this.state.image}?width=7&height=5`} width={400} height={200} alt="R test"/>
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									<Scatterplot width={400} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" />
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									<Scatterplot width={400} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" />
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									{ /* <Hexplot width={400} height={200} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={6} hexMax={10} /> */}
								</Paper>
							</Grid>
						</Grid>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
