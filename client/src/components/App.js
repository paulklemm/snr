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
import NodeBridge from './NodeBridge';
import Authentication from './Authentication';
import GoTerms from './GoTerms';
import Dataset from './Dataset';
import DatasetHub from './DatasetHub';
import DatasetSelect from './DatasetSelect';
import Table from './Table';
import Navbar from './Navbar';
import Loading from './Loading';
import LayoutFactory from './LayoutFactory';
import LoginScreen from './LoginScreen';
import Highlight from './Highlight';
// Third party components
import { Icon } from 'react-fa';
// Material-UI components
import Drawer from 'material-ui/Drawer';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Card, { CardContent } from 'material-ui/Card';
//Material-UI theming
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import orange from 'material-ui/colors/orange';

const styleSheet = {
	appBody: {
		marginRight: 100,
		marginLeft: 100,
	}
};

// Create theme (https://material-ui-1dab0.firebaseapp.com/customization/themes)
const theme = createMuiTheme({
	palette: {
		primary: orange
	},
});

class App extends React.Component {
	constructor() {
		super();
		this.setEnableDataset = this.setEnableDataset.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.setDatasetIcon = this.setDatasetIcon.bind(this);
		this.setPlotDimensions = this.setPlotDimensions.bind(this);
		this.setPlotDimension = this.setPlotDimension.bind(this);
		this.forceUpdateApp = this.forceUpdateApp.bind(this);
		this.invalidateLogin = this.invalidateLogin.bind(this);
		this.addBusyState = this.addBusyState.bind(this);
		this.removeBusyState = this.removeBusyState.bind(this);
		this.filterBroadcasted = this.filterBroadcasted.bind(this);
		this.login = this.login.bind(this);
		// Init datasethub and inject filterTriggered function
		this.datasetHub = new DatasetHub(this.filterBroadcasted);
		this.debug = false;
		this.layoutFactory = new LayoutFactory(16);
		// Init NodeBridge and inject busystate functions
		this.nodeBridge = new NodeBridge(this.addBusyState, this.removeBusyState);
		// Authenticator takes nodebridge as input
		this.authentication = new Authentication(this.nodeBridge);
		// Set Authenticator object for the Node Bridge
		this.nodeBridge.setAuthentication(this.authentication);
		this.state = {
			datasetEnabled: {},
			datasetLoading: {},
			// TODO: This is now still set to the last loaded dataset, should be set using the DatasetSelect Element
			primaryDataset: {},
			loginRequired: false,
			busy: {},
			openDrawer: {right: false},
			xDimension: '',
			yDimension: '',
			highlight: new Highlight('EnsemblID'),
		};
	}

	/**
	 * Sets the Dimension for the hexplots
	 * @param {String} xDimension: Name of x dimension
	 * @param {String} yDimension: Name of y dimension
	 */
	setPlotDimensions(xDimension, yDimension) {
		this.setState({
			xDimension: xDimension,
			yDimension: yDimension
		});
	}

	/**
	 * Sets dimension of new x Dimension. The old one will be cycled to the y dimension
	 * @param {String} newDimension: Name of new Dimension
	 */
	setPlotDimension(newDimension) {
		const lastXDimension = this.state.xDimension;
		this.setState({
			xDimension: newDimension,
			yDimension: lastXDimension
		});
	}

	/**
	 * Enable a dataset means downloading the data
	 * @param {String} name Filename of the dataset on the server
	 * @param {Boolean} enabled Status whether the data should be treated as active or not
	 */
	setEnableDataset(name, enabled) {
		// TODO: Handle removal of 'enabled'
		let requiresLoading = this.datasetHub.setEnable(name, enabled);
		this.setState({
			datasetEnabled: this.datasetHub.enabled
		});
		// Update the count of the small multiples
		this.layoutFactory.setSmallMultiplesCount(this.datasetHub.getCountOfEnabledDatasets());
		if (requiresLoading) {
			this.loadDataset(name);
		}
	}

	/**
	 * Force React update. This function is meant to be accessed by child functions e.g. to react to filtering changes.
	 */
	forceUpdateApp() {
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

	/**
	 * This function will be injected to the DatasetHub object and
	 * is triggered when a new filter was broadcasted to the datasets
	 */
	filterBroadcasted() {
		console.log(`Filter triggered.`);
		this.applyGoTerms();
	}

	/**
	 * TODO: Implement
	 */
	async applyGoTerms() {
		const primaryDatasetData = this.state.primaryDataset.getData();
		const ensemblIds = Helper.objectValueToArray(primaryDatasetData, 'EnsemblID');
		// console.log(ensemblIds);
		// if (ensemblIds.length > 0) {
		// 	const testToGo = await this.goTerms.toGo(ensemblIds, "mmusculus_gene_ensembl", "current");
		// 	console.log(testToGo);
		// }
	}

	/**
	 * Invalidate local login storage and trigger login screen
	 */
	async invalidateLogin() {
		localStorage.clear();
		await this.checkLogin();
	}

	/**
	 * Set state of loginRequired
	 */
	async checkLogin() {
		// Check if login is required
		const loginRequired = await this.authentication.loginRequired();
		// Set state
		this.setState({
			loginRequired: loginRequired
		});
	}

	async initSession() {
		// TODO: Clear existing session first, especially the loaded data sets
		// Check if we ned to login or not
		await this.checkLogin();
		// If we need to login, then there is no local user or token saved. Therefore initSession needs to exit
		if (this.state.loginRequired)
			return;

		// Get GO-Term description
		// Init GOTerms object with getGoSummary and toGo from nodebridge
		// TODO: This "current" thing needs to go away, because this will change!
		// TODO: Set busy state
		this.goTerms = new GoTerms(this.nodeBridge.getGoSummary, this.nodeBridge.getGoPerGene);
		this.goTerms.addGeneToGo('mmusculus_gene_ensembl', 'current');
		this.goTerms.addSummary('mmusculus_gene_ensembl', 'current');

		// Set default plotting dimensions
		this.setPlotDimensions('pValueNegLog10', 'fc');

		// Add busy state for loading data
		// Load Data from userFolder and get Session ID for the associated object
		this.addBusyState('loadData');
		let filenames = await this.nodeBridge.loadData();
		filenames = filenames['filenames'];
		// Attach the dataset array to the datasetHub
		for (let i in filenames) {
			let datasetName = filenames[i];
			this.datasetHub.push(new Dataset(datasetName));
		}
		// Load setEnabled Status
		for (let i in filenames) {
			let datasetName = filenames[i];
			// Default add value to data set, this should later be derived from firebase
			this.setEnableDataset(datasetName, false);
		}

		// Remove busy state
		this.removeBusyState('loadData');
		
		// // PCA plot
		// const outputPCA = await this.runRCommand("sonaR", "plot_pca", { x: outputLoadData.sessionID }, 'ascii', false);
		// this.setState({
		// 	pcaImage: `${outputPCA.graphics[0]}/svg`
		// });
	}

	/**
	 * Sends R command to node server. There it will be executed and return the result in the specified valformat
	 * Example:
	 * runRCommand("sonaR", "getUserFolder", { user: "'paul'" }, "json", 'paul', localStorage.getItem('sonarLoginToken'));
	 * @param {String} rpackage: Name of the `R` package ("stats")
	 * @param {String} rfunction: Name of the `R` function ("rnorm")
	 * @param {Object} params: JSON object of the parameters ("{ n: 10, mean: 5 }"")
	 * @param {String} valFormat: Format of .val attribute (ascii, json, tsv), refer to `https://opencpu.github.io/server-manual/opencpu-server.pdf`
	 * @param {Boolean} debug: Print debug statements, defaults to false
	 * @return {Object} result of command
	 */
	async runRCommand(rpackage, rfunction, params, valformat, debug = false) {
		// Set busy state
		const runKey = `Run R command on node server ${rpackage}.${rfunction}(${JSON.stringify(params)}), valformat: ${valformat}`
		// Busy is a stack of operations. At the beginning, add a unique key for the operation to the busyStack and then remove it after success
		this.addBusyState(runKey);

		// Run the command
		if (debug) console.log(runKey);
		let response = await this.nodeBridge.sendRCommand(rpackage, rfunction, params, valformat);
		if (debug) console.log(response);

		// If Response is negative because of invalid token, invalidate login
		if (typeof response.loginInvalid === 'undefined' && response.loginInvalid === true)
			this.setState({ loginRequired: true });
		// Delete the runKey from the busy array
		this.removeBusyState(runKey);
		// Return resulting object
		return response.result;
	}

	/**
	 * The busy state indicates that there are still requests made to the node back-end where no answers have been received yet.
	 * This function adds a busy state with `busyKey` and updates the react state.
	 * @param {String} busyKey Unique key for busy state
	 */
	addBusyState(busyKey) {
		let busy = this.state.busy;
		busy[busyKey] = true;
		this.setState({ busy: busy });
	}

	/**
	 * The busy state indicates that there are still requests made to the node back-end where no answers have been received yet.
	 * This function removes a busy state with `busyKey` and updates the react state.
	 * 
	 * @param {String} busyKey 
	 */
	removeBusyState(busyKey) {
		let busy = this.state.busy;
		delete busy[busyKey];
		this.setState({ busy: busy });
	}

	/**
	 * Wrapper function for authentication.login to set the local state as required
	 * @param {String} user: User to login
	 * @param {String} password: Password for user
	 * @return {Boolean} Login successfull
	 */
	async login(user, password) {
		// const loginSuccessful = await this.authentication.login('paul', 'bla');
		const loginSuccessful = await this.authentication.login(user, password);
		this.setState({
			loginRequired: !loginSuccessful
		});
		// If login is successful, init the session
		if (loginSuccessful)
			await this.initSession()
		return loginSuccessful;
	}

	/**
	 * Start debug session to not require manual input
	 */
	async debugSession() {
		console.log("Entering Debug mode. Data will be loaded automatically. To disable, set `App.debug` to `false`");
		// Set default plotting dimensions
		this.setPlotDimensions('pValueNegLog10', 'fc');
		// Login Required
		const loginRequired = await this.authentication.loginRequired();
		if (loginRequired)
			console.log("Login required");
		this.setState({
			loginRequired: loginRequired
		});
		// TODO: Debug Login
		// const loginSuccessful = await this.authentication.login('paul', 'bla');
		// this.setState({
		// 	loginRequired: !loginSuccessful
		// });
		// Using setState is not fast enough for the async loading function

		this.datasetHub.push(new Dataset('small.csv'));
		this.setEnableDataset('small.csv', true);
		// this.setState({ openCPULoadDataSessionID: 'x0529ff5682' });
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

	async getPCA() {
		// TODO: Implement PCA
		const pcaOutput = await this.runRCommand("sonaR", "get_pca_loadings", { x: 'x0529ff5682' }, 'json', false);
		console.log(`PCA Output`);
		console.log(pcaOutput);
		// Old plotting logic, ths should be removed later on
		this.runRCommand("sonaR", "plot_pca", { x: 'x0529ff5682' }, 'ascii', true).then(output => {
			this.setState({
				pcaImage: `${output.graphics[0]}/svg`
			});
		});
	}

	/**
	 * Load a dataset from Server
	 * 
	 * @param {String} name Name of dataset to load
	 * @param {Boolean} verbose Verbose output for debugging purposes
	 */
	async loadDataset(name, verbose = false) {
		if (verbose) console.log(`Loading ${name} ...`);

		// Add Busy state
		this.addBusyState(`Load dataset ${name}`);

		// Set dataset to loading
		this.datasetHub.setLoading(name)
		this.setState({datasetLoading: this.datasetHub.loading});
		// Load dataset
		const response = await this.nodeBridge.getDataset(name);
		this.datasetHub.setData(name, response.dataset['.val'].dataset, response.dataset['.val'].dimNames);
		// Loading is done, so update it again
		this.setState({datasetLoading: this.datasetHub.loading});
		this.setState({primaryDataset: this.datasetHub.datasets[name]});

		// Remove busy state
		this.removeBusyState(`Load dataset ${name}`);

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
		if (!this.debug) {
			this.initSession();
		} else {
			this.debugSession();
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
						<Hexplot 
							responsiveWidth={true} 
							height={this.layoutFactory.heights.smallMultiples} 
							width={0} 
							rnaSeqData={dataset} 
							highlight={this.state.highlight} 
							xName={this.state.xDimension} 
							yName={this.state.yDimension} 
							filter={this.datasetHub.filter}
							forceUpdateApp={this.forceUpdateApp}
							hexSize={2}
							hexMax={10}
							showRenderGenesOption={false}
						/>
					</Grid>
				);
			}
		}
		let primaryDatasetData = (this.state.primaryDataset.data === undefined) ? undefined : this.state.primaryDataset.getData();
		let primaryDatasetDimNames = this.state.primaryDataset.dimNames;
		// Add PCA
		let pcaImage = (typeof this.state.pcaImage === "undefined") ? pcaImage = <Loading width={800} height={400} /> : <img src={`${this.state.pcaImage}?width=7&height=5`} width={800} height={400} alt="R test PCA" />;

		let app = ''
		if (this.state.loginRequired) {
			app = <div><LoginScreen login={ this.login } /></div>;
		} else {
			app = 
			<div>
				<Drawer
					anchor="right"
					open={this.state.openDrawer.right}
					onRequestClose={this.handleRightClose}
					onClick={this.handleRightClose}
				>
					<Card style={{ maxWidth: `${this.layoutFactory.windowWidth / 2}px`, minWidth: `${this.layoutFactory.windowWidth / 3}px` }}>
						<CardContent>
							<IconButton style={{ float: 'right' }} onClick={this.toggleRightDrawer}><Icon name="times" /></IconButton>
								<DatasetSelect getMetadata={this.nodeBridge.getMetadata} getDatasetIcon={this.datasetHub.getDatasetIcon} setDatasetIcon={this.setDatasetIcon} datasetEnabled={this.state.datasetEnabled} datasetLoading={this.state.datasetLoading} setEnableDataset={this.setEnableDataset} />
						</CardContent>
					</Card>
				</Drawer>
				<Navbar busy={Object.keys(this.state.busy).length !== 0} toggleRightDrawer={this.toggleRightDrawer} invalidateLogin={this.invalidateLogin} />
				<div style={styleSheet.appBody}>
					{/* Main Plot for the interaction */}
					<Grid container spacing={16}>
						<Grid item xs={8}>
							{/*<center><p>{this.state.primaryDataset.name}</p></center>*/}
							{/* <Hexplot height={this.layoutFactory.heights.mainView} width={600} responsiveWidth={true} rnaSeqData={this.state.primaryDataset} xName="pValueNegLog10" yName="fc" hexSize={4} hexMax={20} showRenderGenesOption={true} /> */}
							<Hexplot
								height={this.layoutFactory.heights.mainView}
								width={600}
								responsiveWidth={true}
								highlight={this.state.highlight}
								rnaSeqData={this.state.primaryDataset}
								xName={this.state.xDimension}
								yName={this.state.yDimension}
								filter={this.datasetHub.filter}
								forceUpdateApp={this.forceUpdateApp}
								hexSize={4}
								hexMax={20}
								showRenderGenesOption={true}
							/>
						</Grid>
						<Grid item xs={4}>
							<Grid container spacing={16}>
								{hexplots}
							</Grid>
						</Grid>
						{/* Add Table on whole page length */}
						<Grid item xs={12}>
							<Table
							data={primaryDatasetData}
							dimNames={primaryDatasetDimNames}
							height={395}
							highlight={this.state.highlight}
							filter={this.datasetHub.filter}
							forceUpdateApp={this.forceUpdateApp}
							changePlotDimension={this.setPlotDimension}
						/>
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
			</div>;
		}
		return (
			<MuiThemeProvider theme={theme}>
				{ app }
			</MuiThemeProvider>
		);
	}
}

export default App;
