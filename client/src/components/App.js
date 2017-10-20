import React from 'react';
// Third party components
import { Icon } from 'react-fa';
// Material-UI components
import Drawer from 'material-ui/Drawer';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Card, { CardContent } from 'material-ui/Card';
// Material-UI theming
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import orange from 'material-ui/colors/orange';
import './App.css';
// Sonar components
// eslint-disable-next-line
import BarChart from './BarChart';
// eslint-disable-next-line
import Scatterplot from './Scatterplot';
import ScatterplotPCA from './ScatterplotPCA.jsx';
// eslint-disable-next-line
import { objectValueToArray, isUndefined, getIris } from './Helper';
// eslint-disable-next-line
import Hexplot from './Hexplot';
// eslint-disable-next-line
import Piechart from './Piechart';
// eslint-disable-next-line
import DynamicHexBin from './DynamicHexBin';
import NodeBridge from './NodeBridge';
import Authentication from './Authentication';
import GoTermHub from './GoTermHub';
import Dataset from './Dataset';
import DatasetHub from './DatasetHub';
import DatasetSelect from './DatasetSelect';
import Table from './Table';
import Navbar from './Navbar';
import LayoutFactory from './LayoutFactory';
import LoginScreen from './LoginScreen';
import Highlight from './Highlight';
import GoPlotHub from './GoPlotHub';
import Welcome from './Welcome';

// Create theme (https://material-ui-1dab0.firebaseapp.com/customization/themes)
const theme = createMuiTheme({
  palette: {
    primary: orange
  }
});

class App extends React.Component {
  constructor() {
    super();
    this.setEnableDataset = this.setEnableDataset.bind(this);
    this.toggleEnabledDataset = this.toggleEnabledDataset.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.setDatasetIcon = this.setDatasetIcon.bind(this);
    this.setPlotDimensions = this.setPlotDimensions.bind(this);
    this.setPlotDimension = this.setPlotDimension.bind(this);
    this.forceUpdateApp = this.forceUpdateApp.bind(this);
    this.invalidateLogin = this.invalidateLogin.bind(this);
    this.addBusyState = this.addBusyState.bind(this);
    this.removeBusyState = this.removeBusyState.bind(this);
    this.filterBroadcasted = this.filterBroadcasted.bind(this);
    this.toggleLeftDrawer = this.toggleLeftDrawer.bind(this);
    this.toggleRightDrawer = this.toggleRightDrawer.bind(this);
    this.setTransformation = this.setTransformation.bind(this);
    this.setAxisValues = this.setAxisValues.bind(this);
    this.setZoom = this.setZoom.bind(this);
    this.login = this.login.bind(this);
    this.toggleMainViewMode = this.toggleMainViewMode.bind(this);
    this.getMetadata = this.getMetadata.bind(this);
    this.getMetadataPromise = this.getMetadataPromise.bind(this);
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
    this.promises = {}; // Collection of promises
    this.state = {
      datasetEnabled: {},
      datasetLoading: {},
      // TODO: This is now still set to the last loaded dataset, should be set
      // using the DatasetSelect Element
      primaryDataset: {},
      loginRequired: false,
      busy: {},
      openDrawer: {
        right: false,
        left: false
      },
      xDimension: '',
      yDimension: '',
      xTransformation: '-log10', // Default transformation on x axis
      yTransformation: 'linear', // Default transformation on y axis
      axisValues: 'untransformed', // Can be 'both', 'transformed' or 'untransformed'
      zoom: true, // Zoom on filtering in the plots
      highlight: new Highlight('EnsemblID'),
      viewMode: 'overview', // Steer the view mode of the main app
      toggleUpdate: true // Dummy variable used for toggling an update in main app
    };
  }

  /**
   * Set default transformation for x and y dimension
   *
   * @param {string} dimension Set transformation for 'x' or 'y'
   * @param {*} transformation Transformation type to set
   */
  setTransformation(dimension, transformation) {
    if (dimension === 'x') {
      this.setState({ xTransformation: transformation });
    } else {
      this.setState({ yTransformation: transformation });
    }
  }

  /**
   * Toggle view mode between overview (PCA) and detailed (scatterplots with small multiples)
   */
  toggleMainViewMode() {
    const viewMode =
      this.state.viewMode === 'overview' ? 'detailed' : 'overview';
    this.setState({ viewMode });
  }

  /**
   * Should plots zoom into selection.
   * @param {boolean} zoom Zoom status
   */
  setZoom(zoom) {
    this.setState({ zoom });
  }

  /**
   * Set rendering option for axis ticks
   * @param {string} axisValues Axis value rendering option. Can be 'both', 'transformed' or 'untransformed'.
   */
  setAxisValues(axisValues) {
    this.setState({ axisValues });
  }

  /**
   * Sets the Dimension for the hexplots
   * @param {String} xDimension: Name of x dimension
   * @param {String} yDimension: Name of y dimension
   */
  setPlotDimensions(xDimension, yDimension) {
    this.setState({
      xDimension,
      yDimension
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
   * Toggle enabled status using `setEnableDataset`
   * @param {String} name Dataset name
   */
  toggleEnabledDataset(name) {
    this.setEnableDataset(name, !this.datasetHub.isEnabled(name));
  }

  /**
   * Enable a dataset means downloading the data
   * @param {String} name Filename of the dataset on the server
   * @param {Boolean} enabled Status whether the data should be treated as active or not
   */
  setEnableDataset(name, enabled) {
    // TODO: Handle removal of 'enabled'
    const requiresLoading = this.datasetHub.setEnable(name, enabled);
    this.setState({
      datasetEnabled: this.datasetHub.enabled
    });
    // Update the count of the small multiples
    this.layoutFactory.setSmallMultiplesCount(
      this.datasetHub.getCountOfEnabledDatasets()
    );
    if (requiresLoading) {
      this.loadDataset(name);
    }
  }

  getMetadataPromise(name) {
    if (isUndefined(this.promises.name)) {
      this.promises.name = this.getMetadata(name);
    }
    return this.promises.name;
  }

  /**
   * Get meta data for dataset
   * @param {string} name Dataset
   * @return {array} metadata
   */
  async getMetadata(name) {
    // If metadata is defined in datasethub, return it
    const metadataHub = this.datasetHub.getMetadata(name);
    if (!isUndefined(metadataHub)) {
      return metadataHub;
    }
    // When not defined, retrieve it from the server
    let metadataResponse = await this.nodeBridge.getMetadata(name);
    // Handle errors
    if (!metadataResponse.success) {
      metadataResponse.metadata = { Error: [`Cannot derive data for ${name}`] };
    }
    // Push metadata to DatasetHub
    this.datasetHub.setMetadata(name, metadataResponse.metadata);
    // Return processed metadata
    return this.datasetHub.getMetadata(name);
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
    this.applyGoTerms();
  }

  /**
   * Get GO-Terms
   */
  async applyGoTerms() {
    // Check if we have a primary dataset
    if (isUndefined(this.state.primaryDataset.data)) {
      return;
    }
    // Get the (filtered) primary dataset
    const primaryDatasetData = this.state.primaryDataset.getData();
    // console.log(`Filtered dataset size: ${primaryDatasetData.length}`);
    // console.log('Dataset Object:');
    // console.log(this.state.primaryDataset);
    // Get ensembl-ID array
    const ensemblIds = objectValueToArray(primaryDatasetData, 'EnsemblID');
    // Only proceed if the selection of ensembl IDs is not 0
    if (ensemblIds.length === 0) return;

    // Get collection pointing GO-ids to arrays of ensembl-ids in the filter
    const goTerms = await this.goTermHub.getGoTerms(ensemblIds);
    // Sort the GOTermArray
    this.setState({
      goTerms: this.goTermHub.sortGoTerms(goTerms)
    });
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

  /**
   * Get PCA from node server
   */
  async getPCA() {
    console.log('Get loadings of PCA');
    const loadings = await this.nodeBridge.getPcaLoadings(
      'mmusculus_gene_ensembl',
      'current'
    );
    this.setState({
      pca: loadings.loadings['.val']
    });
    console.log(loadings);
  }

  async initSession() {
    // TODO: Clear existing session first, especially the loaded data sets
    // Check if we ned to login or not
    await this.checkLogin();
    // If we need to login, then there is no local user or token saved. Therefore initSession needs to exit
    if (this.state.loginRequired) return;

    // PCA Plot
    this.getPCA();

    // Get GO-Term description
    // TODO: This "current" thing needs to go away, because this will change!
    this.goTermHub = new GoTermHub(
      this.nodeBridge.getGoSummary,
      this.nodeBridge.getGoPerGene
    );
    this.goTermHub.addGeneToGo('mmusculus_gene_ensembl', 'current');
    this.goTermHub.addSummary('mmusculus_gene_ensembl', 'current');
    // DEBUG
    // this.datasetHub.push(new Dataset('Dataset_2.csv'));
    // this.setEnableDataset('Dataset_2.csv', true);
    // Set default plotting dimensions
    this.setPlotDimensions('pValue', 'fc');

    // Load private and public data into the system
    this.loadData(true);
    this.loadData(false);
  }

  /**
   * Load data from server and store it in datasetHub
   * @param {boolean} privateData Load private data. If false, load public data
   */
  async loadData(privateData = true) {
    // Add busy state for loading data
    // Load Data from userFolder and get Session ID for the associated object
    const busyStateString = `loadData privateData: ${privateData}`;
    this.addBusyState(busyStateString);
    let filenames = privateData 
      ? await this.nodeBridge.loadData()
      : await this.nodeBridge.loadPublicData();
    filenames = filenames.filenames;
    // Attach the dataset array to the datasetHub
    for (const datasetName of filenames) {
      this.datasetHub.push(new Dataset(datasetName));
    }
    // Load setEnabled Status
    for (const datasetName of filenames) {
      // Default add value to data set, this should later be derived from firebase
      this.setEnableDataset(datasetName, false);
    }

    // Remove busy state
    this.removeBusyState(busyStateString);
  }

  /**
   * Sends R command to node server. There it will be executed and return the
   * result in the specified valformat
   * Example:
   * runRCommand("sonaR",
   *   "getUserFolder",
   *   { user: "'paul'" },
   *   "json",
   *   'paul',
   *   localStorage.getItem('sonarLoginToken'));
   * @param {String} rpackage: Name of the `R` package ("stats")
   * @param {String} rfunction: Name of the `R` function ("rnorm")
   * @param {Object} params: JSON object of the parameters ("{ n: 10, mean: 5 }"")
   * @param {String} valFormat: Format of .val attribute (ascii, json, tsv), refer to `https://opencpu.github.io/server-manual/opencpu-server.pdf`
   * @param {Boolean} debug: Print debug statements, defaults to false
   * @return {Object} result of command
   */
  async runRCommand(rpackage, rfunction, params, valformat, debug = false) {
    // Set busy state
    const runKey = `Run R command on node server \
      ${rpackage}.${rfunction}(${JSON.stringify(params)}), \
      valformat: ${valformat}`;
    // Busy is a stack of operations. At the beginning, add a unique key for the
    // operation to the busyStack and then remove it after success
    this.addBusyState(runKey);

    // Run the command
    if (debug) console.log(runKey);
    const response = await this.nodeBridge.sendRCommand(
      rpackage,
      rfunction,
      params,
      valformat
    );
    if (debug) console.log(response);

    // If Response is negative because of invalid token, invalidate login
    if (isUndefined(response.loginInvalid) && response.loginInvalid === true)
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
    if (loginSuccessful) await this.initSession();
    return loginSuccessful;
  }

  /**
   * Start debug session to not require manual input
   */
  async debugSession() {
    console.log(
      'Entering Debug mode. Data will be loaded automatically. To disable, set `App.debug` to `false`'
    );
    // Set default plotting dimensions
    this.setPlotDimensions('pValueNegLog10', 'fc');
    // Login Required
    const loginRequired = await this.authentication.loginRequired();
    if (loginRequired) console.log('Login required');
    this.setState({
      loginRequired: loginRequired
    });
    // TODO: Debug Login
    // const loginSuccessful = await this.authentication.login('paul', 'bla');
    // this.setState({
    //   loginRequired: !loginSuccessful
    // });
    // Using setState is not fast enough for the async loading function
  }

  /**
   * Force React update. This function is meant to be accessed by child
   * functions e.g. to react to filtering changes.
   */
  forceUpdateApp() {
    this.setState({
      toggleUpdate: !this.state.toggleUpdate
    });
    // this.forceUpdate();
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
    this.datasetHub.setLoading(name);
    this.setState({ datasetLoading: this.datasetHub.loading });
    // Load dataset
    const response = await this.nodeBridge.getDataset(name);
    this.datasetHub.setData(
      name,
      response.dataset['.val'].dataset,
      response.dataset['.val'].dimNames
    );
    // Loading is done, so update it again
    this.setState({ datasetLoading: this.datasetHub.loading });
    this.setState({ primaryDataset: this.datasetHub.datasets[name] });

    // Remove busy state
    this.removeBusyState(`Load dataset ${name}`);

    if (verbose) console.log(`Loading ${name} done!`);
    if (verbose) console.log(this.datasetHub.datasets);
  }

  /** https://stackoverflow.com/questions/19014250/reactjs-rerender-on-browser-resize */
  handleResize(event, debug = false) {
    if (debug)
      console.log(
        `Resize Window, width: ${window.innerWidth}, height: ${window.innerHeight}`
      );
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
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  toggleRightDrawer() {
    this.toggleDrawer('right', !this.state.openDrawer.right);
  }

  toggleLeftDrawer() {
    this.toggleDrawer('left', !this.state.openDrawer.left);
  }

  toggleDrawer(side, open) {
    const drawerState = {};
    drawerState[side] = open;
    this.setState({ openDrawer: drawerState });
  }

  getGoDrawer(leftDrawerWidth) {
    const goPlotHub = this.state.openDrawer.left ? (
      <GoPlotHub
        goTerms={this.state.goTerms}
        dataset={this.state.primaryDataset}
        datasetHub={this.datasetHub}
        highlight={this.state.highlight}
        forceUpdateApp={this.forceUpdateApp}
        goTermHub={this.goTermHub}
        width={leftDrawerWidth}
      />
    ) : (
      ''
    );
    return (
      <Drawer anchor="left" type="persistent" open={this.state.openDrawer.left}>
        <div
          style={{
            maxWidth: `${leftDrawerWidth}px`,
            minWidth: `${leftDrawerWidth}px`,
            padding: '10px'
          }}
        >
          <IconButton
            style={{ float: 'right' }}
            onClick={this.toggleLeftDrawer}
          >
            <Icon name="times" />
          </IconButton>
          {goPlotHub}
        </div>
      </Drawer>
    );
  }

  render() {
    const leftDrawerWidth = this.layoutFactory.windowWidth / 3;
    const styleSheet = {
      appBody: {
        marginRight: 100,
        marginLeft: 100,
        paddingLeft: this.state.openDrawer.left ? leftDrawerWidth : 0
      }
    };
    // Create Hexplot dynamic from inbox data
    const hexplots = [];
    this.datasetHub.names.forEach(name => {
      const dataset = this.datasetHub.datasets[name];
      if (dataset.loaded) {
        hexplots.push(
          <Grid item xs={6} key={name}>
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
              setTransformation={this.setTransformation}
              setZoom={this.setZoom}
              xTransformation={this.state.xTransformation}
              yTransformation={this.state.yTransformation}
              zoom={this.state.zoom}
              axisValues={this.state.axisValues}
              setAxisValues={this.setAxisValues}
            />
          </Grid>
        );
      }
    });
    const primaryDatasetData =
      this.state.primaryDataset.data === undefined
        ? undefined
        : this.state.primaryDataset.getData();
    const primaryDatasetDimNames = this.state.primaryDataset.dimNames;

    // Create welcome text
    const welcome = isUndefined(this.state.primaryDataset.data) ? (
      <Grid item xs={12}>
        <Welcome />
      </Grid>
    ) : (
      ''
    );

    // Choose between Small Multiples View and Overview
    let appBody = '';
    if (this.state.viewMode === 'detailed') {
      appBody = (
        <Grid container spacing={16}>
          {welcome}
          <Grid item xs={8}>
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
              setTransformation={this.setTransformation}
              setZoom={this.setZoom}
              xTransformation={this.state.xTransformation}
              yTransformation={this.state.yTransformation}
              zoom={this.state.zoom}
              axisValues={this.state.axisValues}
              setAxisValues={this.setAxisValues}
            />
          </Grid>
          {/* Small multiples */}
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
      );
    } else {
      appBody = (
        <Grid container spacing={16}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <ScatterplotPCA
              width={200}
              height={this.layoutFactory.heights.mainView}
              responsiveWidth={true}
              pca={this.state.pca}
              datasetHub={this.datasetHub}
              xPc={1}
              yPc={2}
              toggleEnabledDataset={this.toggleEnabledDataset}
              getMetadataPromise={this.getMetadataPromise}
            />
          </Grid>
          <Grid item xs={1} />
        </Grid>
      );
    }

    let app = '';
    if (this.state.loginRequired) {
      app = (
        <div>
          <LoginScreen login={this.login} />
        </div>
      );
    } else {
      app = (
        <div>
          {this.getGoDrawer(leftDrawerWidth)}
          <Drawer
            anchor="right"
            open={this.state.openDrawer.right}
            onRequestClose={this.handleRightClose}
            onClick={this.handleRightClose}
          >
            <Card
              style={{
                maxWidth: `${this.layoutFactory.windowWidth / 2}px`,
                minWidth: `${this.layoutFactory.windowWidth / 3}px`
              }}
            >
              <CardContent>
                <IconButton
                  style={{ float: 'right' }}
                  onClick={this.toggleRightDrawer}
                >
                  <Icon name="times" />
                </IconButton>
                <DatasetSelect
                  getMetadata={this.nodeBridge.getMetadata}
                  getDatasetIcon={this.datasetHub.getDatasetIcon}
                  setDatasetIcon={this.setDatasetIcon}
                  datasetEnabled={this.state.datasetEnabled}
                  datasetLoading={this.state.datasetLoading}
                  setEnableDataset={this.setEnableDataset}
                />
              </CardContent>
            </Card>
          </Drawer>
          <div
            style={{
              marginLeft: this.state.openDrawer.left ? leftDrawerWidth : 0
            }}
          >
            <Navbar
              busy={Object.keys(this.state.busy).length !== 0}
              toggleRightDrawer={this.toggleRightDrawer}
              toggleLeftDrawer={this.toggleLeftDrawer}
              toggleMainViewMode={this.toggleMainViewMode}
              mainViewMode={this.state.viewMode}
              invalidateLogin={this.invalidateLogin}
            />
          </div>
          <div style={styleSheet.appBody}>{appBody}</div>
        </div>
      );
    }
    return <MuiThemeProvider theme={theme}>{app}</MuiThemeProvider>;
  }
}

export default App;
