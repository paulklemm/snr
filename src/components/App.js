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
import Table from './Table';
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
		this.debug = true;
		this.state = {
			datasetEnabled: {},
			datasetLoading: {},
			// Debug
			hexplotData: {}
		};
	}

	/**
	 * Enable a dataset means downloading the data
	 * @param {String} name Filename of the dataset on the server
	 * @param {Boolean} enabled Status whether the data should be treated as active or not
	 */
	setEnableDataset(name, enabled) {
		let requiresLoading = this.datasetHub.setEnable(name, enabled);
		this.setState({
			datasetEnabled: this.datasetHub.enabled
		});
		if (requiresLoading) {
			this.loadDataset(name);
		}
	}

	async loadDataset(name, verbose = false) {
		if (verbose) console.log(`Loading ${name} ...`);

		// Set dataset to loading
		this.datasetHub.setLoading(name)
		this.setState({datasetLoading: this.datasetHub.loading});
		let dataset = await this.openCPU.runRCommand("sonaR", "get_dataset", { datasets: "x085f08d09d", name: `'${name}'`}, 'json', false);
		this.datasetHub.setData(name, dataset['.val']);
		// Loading is done, so update it again
		this.setState({datasetLoading: this.datasetHub.loading});
		// DEBUG
		this.datasetHub.filterFPKM(10);
		this.setState({hexplotData: this.datasetHub.datasets[name]});

		if (verbose) console.log(`Loading ${name} done!`);
		if (verbose) console.log(this.datasetHub.datasets);
	}

	componentWillMount() {
		// Debug RNASeq connection
		this.openCPU = new OpenCPUBridge('http://localhost:8004');
		// let r = new R(openCPU);
		if (!this.debug) {
			this.openCPU.runRCommand("sonaR", "get_data_names", { x: "x085f08d09d"}, 'json', false).then(output => {
				for (let i in output['.val']) {
					let datasetName = output['.val'][i];
					this.datasetHub.push(new Dataset(datasetName));
				}
				// Load setEnambled Status
				for (let i in output['.val']) {
					let datasetName = output['.val'][i];
					// Default add value to data set, this should later be derived from firebase
					this.setEnableDataset(datasetName, false);
				}
			});
		} else {
			console.log("DEBUG");
			this.datasetHub.push(new Dataset('dieterich-pipeline_ncd_hfd.csv'));
			this.setEnableDataset('dieterich-pipeline_ncd_hfd.csv', true);
		}
			// openCPU.runRCommand("graphics", "hist", { x: Helper.objectValueToArray(rnaSeqData.default.data, 'pValue'), breaks: 10}, 'ascii', false).then(output => {
			this.openCPU.runRCommand("graphics", "hist", { x: "[1,2,2,2,3,4,5,6,6,7]", breaks: 10}, 'ascii', false).then(output => {
				this.setState({
					image: `${output.graphics[0]}/svg`
				});
		});
	}

	// TODO Fix stres test
	render() {
		// Create Hexplot dynamic from inbox data
		let hexplots = [];
		for (let i in this.datasetHub.names) {
			let name = this.datasetHub.names[i];
			let dataset = this.datasetHub.datasets[name];
			if (dataset.loaded) {
				hexplots.push(
					<Grid item xs key={ name }>
						<Paper>
							<Hexplot height={200} width={300} rnaSeqData={ dataset } xName="negLog10_p_value" yName="fc" hexSize={4} hexMax={20} />
						</Paper>
					</Grid>
				);
			}
		}
		return (
			<MuiThemeProvider>
				<div>
					<Navbar />
					<div style={styleSheet.appBody}>
						<Grid container gutter={16}>
							{/* <BarChart width={200} height={200} /> */}
							{/* <Scatterplot width={200} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" /> */}
							{/* <ScatterplotRNASeqData width={200} height={200} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" /> */}
							{/* <ScatterplotRNASeqData width={600} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" /> */}
							{/* <Hexplot width={600} height={400} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" hexSize={10} hexMax={10} /> */}
							{/* <Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/> */}
							{/* <Hexplot width={500} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={10} hexMax={10} /> */}
							<Grid item xs={12}>
								<Paper>
									<Table data={this.state.hexplotData.data} height={400} onFilter={ this.datasetHub.onFilter }/>
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									<DatasetSelect datasetEnabled={ this.state.datasetEnabled } datasetLoading={ this.state.datasetLoading } setEnableDataset={ this.setEnableDataset }/>
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
							{ hexplots }
						</Grid>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
