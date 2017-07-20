import React from 'react';
import './App.css';
// Sonar components
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
import OpenCPUBridge from './OpenCPUBridge';
import NodeBridge from './NodeBridge';
import Authentication from './Authentication';
import Dataset from './Dataset';
import DatasetHub from './DatasetHub';
import DatasetSelect from './DatasetSelect';
import Table from './Table';
import Navbar from './Navbar';
import Loading from './Loading';
import LayoutFactory from './LayoutFactory';
// Third party components
import { Icon } from 'react-fa';
// Material-UI components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Drawer from 'material-ui/Drawer';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import Card, { CardContent } from 'material-ui/Card';

const styleSheet = {
	appBody: {
		marginRight: 10,
		marginLeft: 10,
	}
};

class App extends React.Component {
	constructor() {
		super();
		this.setEnableDataset = this.setEnableDataset.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.setDatasetIcon = this.setDatasetIcon.bind(this);
		this.datasetHub = new DatasetHub();
		this.debug = true;
		this.layoutFactory = new LayoutFactory(16);
		// Init NodeBridge
		this.nodeBridge = new NodeBridge();
		// Authenticator takes nodebridge as input
		this.authentication = new Authentication(this.nodeBridge);
		this.state = {
			datasetEnabled: {},
			datasetLoading: {},
			openCPULoadDataSessionID: "",
			// TODO: This is now still set to the last loaded dataset, should be set using the DatasetSelect Element
			primaryDataset: {},
			openDrawer: {right: false}
		};
	}

	/**
	 * Enable a dataset means downloading the data
	 * @param {String} name Filename of the dataset on the server
	 * @param {Boolean} enabled Status whether the data should be treated as active or not
	 */
	setEnableDataset(name, enabled) {
		// Update the countf of the small multiples
		// TODO: Handle removal of 'enabled'
		this.layoutFactory.increaseSmallMultiplesCount();
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

	/**
	 * Wrapper function to set icon of dataset and to force update after it is set
	 * @param {String} datasetName
	 * @param {String} icon name, get icon from DatasetIcons
	 */
	setDatasetIcon(datasetName, icon) {
		this.datasetHub.setDatasetIcon(datasetName, icon);
		console.log(this.datasetHub);
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
		const pcaOutput = await this.openCPU.runRCommand("sonaR", "get_pca_loadings", { x: 'x040fdf7f13' }, 'json', false);
		console.log(`PCA Output`);
		console.log(pcaOutput);
		// Old plotting logic, ths should be removed later on
		this.openCPU.runRCommand("sonaR", "plot_pca", { x: 'x040fdf7f13' }, 'ascii', true).then(output => {
			this.setState({
				pcaImage: `${output.graphics[0]}/svg`
			});
		});
	}

	async loadDataset(name, verbose = false) {
		if (verbose) console.log(`Loading ${name} ...`);

		// Set dataset to loading
		this.datasetHub.setLoading(name)
		this.setState({datasetLoading: this.datasetHub.loading});
		// Load the dataset
		let dataset = await this.openCPU.runRCommand("sonaR", "get_dataset", { datasets: this.state.openCPULoadDataSessionID, name: `'${name}'`}, 'json', true);
		this.datasetHub.setData(name, dataset['.val'].dataset, dataset['.val'].dimNames);
		// Loading is done, so update it again
		this.setState({datasetLoading: this.datasetHub.loading});
		this.setState({primaryDataset: this.datasetHub.datasets[name]});

		if (verbose) console.log(`Loading ${name} done!`);
		if (verbose) console.log(this.datasetHub.datasets);
	}

	/** https://stackoverflow.com/questions/19014250/reactjs-rerender-on-browser-resize */
	handleResize(event, debug = false) {
		if (debug) console.log(`Resize Window, width: ${window.innerWidth}, height: ${window.innerHeight}`);
		this.layoutFactory.updateWindowSize(window.innerWidth, window.innerHeight);
		this.forceUpdate();
	}

	componentWillMount() {
		this.handleResize();
		// Debug RNASeq connection
		this.openCPU = new OpenCPUBridge('http://localhost:8004');
		// let r = new R(openCPU);
		if (!this.debug) {
			this.initSession()
		} else {
			console.log("DEBUG");
			// TODO: Debug Login
			const loginSuccessful = this.authentication.login('paul', 'bla');
			console.log(`Login Successful: ${loginSuccessful}`);
			// Using setState is not fast enough for the async loading function
			this.state['openCPULoadDataSessionID'] = 'x040fdf7f13';
			// this.setState({ openCPULoadDataSessionID: 'x040fdf7f13' });
			// this.datasetHub.push(new Dataset('DIFFEXPR_EXPORT6952_DATASET10020.csv'));
			// this.setEnableDataset('DIFFEXPR_EXPORT6952_DATASET10020.csv', true);
			// this.datasetHub.push(new Dataset('DIFFEXPR_EXPORT6938_DATASET10016.csv'));
			// this.setEnableDataset('DIFFEXPR_EXPORT6938_DATASET10016.csv', true);
			// this.datasetHub.push(new Dataset('DIFFEXPR_EXPORT6945_DATASET10018.csv'));
			// this.setEnableDataset('DIFFEXPR_EXPORT6945_DATASET10018.csv', true);
			// this.datasetHub.push(new Dataset('DIFFEXPR_EXPORT6957_DATASET10022.csv'));
			// this.setEnableDataset('DIFFEXPR_EXPORT6957_DATASET10022.csv', true);
			// this.datasetHub.push(new Dataset('DIFFEXPR_EXPORT6964_DATASET10024.csv'));
			// this.setEnableDataset('DIFFEXPR_EXPORT6964_DATASET10024.csv', true);
			// Run PCA
			// this.getPCA();
		}
	}

	componentDidMount() {
		window.addEventListener("resize", this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
	}
 
	toggleRightDrawer = () => this.toggleDrawer('right', !this.state.openDrawer.right)
	toggleDrawer = (side, open) => {
		const drawerState = {};
		drawerState[side] = open;
		this.setState({ openDrawer: drawerState });
	};

	render() {
		// Create Hexplot dynamic from inbox data
		let hexplots = [];
		for (let i in this.datasetHub.names) {
			let name = this.datasetHub.names[i];
			let dataset = this.datasetHub.datasets[name];
			if (dataset.loaded) {
				hexplots.push(
					<Grid item xs={6} key={ name }>
						<Paper>
							<Hexplot responsiveWidth={true} height={this.layoutFactory.heights.smallMultiples} width={0} rnaSeqData={dataset} xName="pValueNegLog10" yName="fc" hexSize={2} hexMax={10} showRenderGenesOption={false}/>
						</Paper>
					</Grid>
				);
			}
		}
		let primaryDatasetData = (this.state.primaryDataset.data === undefined) ? undefined : this.state.primaryDataset.getData();
		let primaryDatasetDimNames = this.state.primaryDataset.dimNames;
		// Add PCA
		let pcaImage = (typeof this.state.pcaImage === "undefined") ? pcaImage = <Loading width={800} height={400} /> : <img src={`${this.state.pcaImage}?width=7&height=5`} width={800} height={400} alt="R test PCA" />;
		return (
			<MuiThemeProvider>
				<div>
					<Drawer
						anchor="right"
						open={this.state.openDrawer.right}
						onRequestClose={this.handleRightClose}
						onClick={this.handleRightClose}
						docked={true}
					>
						<Card style={{ maxWidth: `${this.layoutFactory.windowWidth / 2}px` }}>
							<CardContent>
								<IconButton style={{ float: 'right' }} onClick={this.toggleRightDrawer}><Icon name="times" /></IconButton>
								{<DatasetSelect getDatasetIcon={ this.datasetHub.getDatasetIcon } setDatasetIcon={ this.setDatasetIcon } datasetEnabled={this.state.datasetEnabled} datasetLoading={this.state.datasetLoading} setEnableDataset={this.setEnableDataset} />}
							</CardContent>
						</Card>
					</Drawer>
					<Navbar toggleRightDrawer={this.toggleRightDrawer} />
					<div style={styleSheet.appBody}>
						{/* Main Plot for the interaction */}
						<Grid container gutter={16}>
							<Grid item xs={8}>
								<Paper>
									{/*<center><p>{this.state.primaryDataset.name}</p></center>*/}
									<Hexplot height={this.layoutFactory.heights.mainView} width={600} responsiveWidth={true} rnaSeqData={this.state.primaryDataset} xName="pValueNegLog10" yName="fc" hexSize={4} hexMax={20} showRenderGenesOption={false}/>
								</Paper>
							</Grid>
							<Grid item xs={4}>
								<Grid container gutter={16}>
									{hexplots}
								</Grid>
							</Grid>
							{/* Add Table on whole page length */}
							<Grid item xs={12}>
								<Paper>
									<Table data={primaryDatasetData} dimNames={primaryDatasetDimNames} height={400} onFilter={this.onFilter} />
								</Paper>
							</Grid>
						</Grid>
							{/*<Paper>
								<Table data={primaryDatasetData} dimNames={primaryDatasetDimNames} height={400} onFilter={this.onFilter} />
							</Paper>
							<Grid item xs>
								<Paper>
									{pcaImage}
								</Paper>
							</Grid>
							{hexplots}*/}
						
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
