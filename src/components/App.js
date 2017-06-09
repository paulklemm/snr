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
		this.onFilter = this.onFilter.bind(this);
		this.datasetHub = new DatasetHub();
		this.debug = true;
		this.state = {
			datasetEnabled: {},
			datasetLoading: {},
			openCPULoadDataSessionID: "",
			// TODO: This is now still set to the last loaded dataset, should be set using the DatasetSelect Element
			primaryDataset: {}
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

	/**
	 * Filter bridge function usable by elements that provide a filter for data
	 * @param  {String} name: Dimension name to be filtered
	 * @param  {Object} val: Filter value can be anything depending on the dimension type
	 * @param  {Object} operator: Filter operator, either `=`, `<` or `>`. Strings should always use `=`
	 */
	onFilter(name, val, operator) {
		this.datasetHub.onFilter(name, val, operator);
		this.forceUpdate();
	}

	async initSession() {
		// get the personal folder
		const output = await this.openCPU.runRCommand("sonaR", "getUserFolder", { user: "'paul'" }, "json", false);
		// Output is array containing a string, therefore this looks a bit ugly here
		let userFolder = output['.val'][0];

		// Load Data from userFolder and get Session ID for the associated object
		const outputLoadData = await this.openCPU.runRCommand("sonaR", "load_data", { data_folder: `'${userFolder}'` }, "json", false);
		console.log(`LoadData Session ID: ${outputLoadData.sessionID}`);
		// Update state with sessionID
		this.setState({ openCPULoadDataSessionID: outputLoadData.sessionID });

		// Get dataset list as array
		const outputGetDataNames = await this.openCPU.runRCommand("sonaR", "get_data_names", { x: `${outputLoadData.sessionID}` }, 'json', false);
		// Attach the dataset array to the datasetHub
		for (let i in outputGetDataNames['.val']) {
			let datasetName = outputGetDataNames['.val'][i];
			this.datasetHub.push(new Dataset(datasetName));
		}
		// Load setEnambled Status
		for (let i in outputGetDataNames['.val']) {
			let datasetName = outputGetDataNames['.val'][i];
			// Default add value to data set, this should later be derived from firebase
			this.setEnableDataset(datasetName, false);
		}
		
		// PCA plot
		const outputPCA = await this.openCPU.runRCommand("sonaR", "plot_pca", { x: outputLoadData.sessionID }, 'ascii', false);
		this.setState({
			pcaImage: `${outputPCA.graphics[0]}/svg`
		});
	}

	async getPCA() {
		// TODO: Implement PCA
		// console.log(`OpenCPU Session ID for getPCA: 'x0c2297be2f'`);
		// const pcaOutput = await this.openCPU.runRCommand("sonaR", "getPCALoadings", { x: 'x0c2297be2f' }, 'json', false);
		// console.log(pcaOutput);
		// // Old plotting logic, ths should be removed later on
		// this.openCPU.runRCommand("sonaR", "plot_pca", { x: 'x0c2297be2f' }, 'ascii', true).then(output => {
		// 	this.setState({
		// 		pcaImage: `${output.graphics[0]}/svg`
		// 	});
		// });
	}

	async loadDataset(name, verbose = false) {
		if (verbose) console.log(`Loading ${name} ...`);

		// Set dataset to loading
		this.datasetHub.setLoading(name)
		this.setState({datasetLoading: this.datasetHub.loading});
		// let dataset = await this.openCPU.runRCommand("sonaR", "getDataset", { datasets: "x0c2297be2f", name: `'${name}'`}, 'json', false);
		let dataset = await this.openCPU.runRCommand("sonaR", "getDataset", { datasets: this.state.openCPULoadDataSessionID, name: `'${name}'`}, 'json', true);
		this.datasetHub.setData(name, dataset['.val'].dataset, dataset['.val'].dimNames);
		// Loading is done, so update it again
		this.setState({datasetLoading: this.datasetHub.loading});
		// DEBUG
		// this.datasetHub.filterFPKM(10);
		this.setState({primaryDataset: this.datasetHub.datasets[name]});

		if (verbose) console.log(`Loading ${name} done!`);
		if (verbose) console.log(this.datasetHub.datasets);
	}

	componentWillMount() {
		// Debug RNASeq connection
		this.openCPU = new OpenCPUBridge('http://localhost:8004');
		// let r = new R(openCPU);
		if (!this.debug) {
			this.initSession()
		} else {
			console.log("DEBUG");
			// Using setState is not fast enough for the async loading function
			this.state['openCPULoadDataSessionID'] = 'x0c2297be2f';
			// this.setState({ openCPULoadDataSessionID: 'x0c2297be2f' });
			this.datasetHub.push(new Dataset('DIFFEXPR_EXPORT6952_DATASET10020.csv'));
			this.setEnableDataset('DIFFEXPR_EXPORT6952_DATASET10020.csv', true);
			// Run PCA
			this.getPCA();
		}
	}

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
							<Hexplot height={200} width={300} rnaSeqData={ dataset } xName="pValue" yName="fc" hexSize={4} hexMax={20} />
						</Paper>
					</Grid>
				);
			}
		}
		let primaryDatasetData = (this.state.primaryDataset.data === undefined) ? undefined : this.state.primaryDataset.getData();
		let primaryDatasetDimNames = this.state.primaryDataset.dimNames;
		return (
			<MuiThemeProvider>
				<div>
					<Navbar />
					<div style={styleSheet.appBody}>
						<Grid container gutter={16}>
							<Grid item xs={12}>
								<Paper>
									<Table data={primaryDatasetData} dimNames={primaryDatasetDimNames} height={400} onFilter={ this.onFilter }/>
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									<DatasetSelect datasetEnabled={ this.state.datasetEnabled } datasetLoading={ this.state.datasetLoading } setEnableDataset={ this.setEnableDataset }/>
								</Paper>
							</Grid>
							<Grid item xs>
								<Paper>
									<img src={`${this.state.pcaImage}?width=7&height=5`} width={800} height={400} alt="R test PCA"/>
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
