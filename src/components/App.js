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
		this.datasetHub = new DatasetHub();
		
		this.state = {
			// datasets: {},
			datasetEnabled: {},
			// Debug
			hexplotData: {}
		};
	}

	setEnableDataset(name, enabled) {
		let requiresLoading = this.datasetHub.setEnable(name, enabled);
		this.setState({
			datasetEnabled: this.datasetHub.enabled
		});
		if (requiresLoading) {
			console.log("Loading required");
			this.loadDataset(name);
		}



		// let datasetEnabled = {...this.state.datasetEnabled};
		// datasetEnabled[name] = enabled;
		// this.setState({
		// 	datasetEnabled: datasetEnabled
		// });
		// // Set enabled of the dataset
		// this.state.datasets[name].enabled = enabled;
		// // Check if we have to initialize loading of the data set
		// if (this.state.datasets[name].loaded === false && enabled) {
		// 	console.log("Loading required");
		// 	this.loadDataset(name);
		// }
	}

	async loadDataset(name) {
		console.log(`Loading ${name} ...`);
		let dataset = await this.openCPU.runRCommand("sonaR", "get_dataset", { datasets: "x0f2853db6b", name: `'${name}'`}, 'json', true);
		console.log(`Loading ${name} done!`);
		// this.state.datasets[name].setData(dataset['.val']);
		this.datasetHub.setData(name, dataset['.val']);
		console.log(this.datasetHub.datasets);
		// console.log(this.state.datasets[name]);
		// DEBUG
		// this.setState({hexplotData: this.state.datasets[name]});
		this.setState({hexplotData: this.datasetHub.datasets[name]});
		this.forceUpdate();
	}

	componentWillMount() {
		// Debug RNASeq connection
		this.openCPU = new OpenCPUBridge('http://localhost:8004');
		// let r = new R(openCPU);
		this.openCPU.runRCommand("sonaR", "get_data_names", { x: "x0f2853db6b"}, 'json', false).then(output => {
			console.log(output);
			// let datasets = {...this.state.datasets};
			// let datasetEnabled = {...this.state.datasetEnabled};
			// let datasetHub = {...this.state.dataHub};
			for (let i in output['.val']) {
				let datasetName = output['.val'][i];
				this.datasetHub.push(new Dataset(datasetName));
				// datasets[datasetName] = new Dataset(datasetName);
				// datasetEnabled[datasetName] = false;
			}
			// this.setState({
			// 	// datasetHub: datasetHub
			// 	datasets: datasets,
			// });

			// Load setEnambled Status
			for (let i in output['.val']) {
				let datasetName = output['.val'][i];
				// Default add value to data set, this should later be derived from firebase
				this.setEnableDataset(datasetName, false);
			}
		});
			// openCPU.runRCommand("graphics", "hist", { x: Helper.objectValueToArray(rnaSeqData.default.data, 'pValue'), breaks: 10}, 'ascii', false).then(output => {
			this.openCPU.runRCommand("graphics", "hist", { x: "[1,2,2,2,3,4,5,6,6,7]", breaks: 10}, 'ascii', false).then(output => {
				this.setState({
					image: `${output.graphics[0]}/svg`
				});
		});
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
									<Hexplot width={400} height={200} rnaSeqData={ this.state.hexplotData } xName="pValue" yName="fc" hexSize={5} hexMax={30} />
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
