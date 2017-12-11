import React from 'react';
// Third party components
import { Icon } from 'react-fa';
// Material-UI components
import Drawer from 'material-ui/Drawer';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
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
import { objectValueToArray, isUndefined, getIris, areIdentical } from './Helper';
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
    primary: orange,
  },
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
    this.setBiomartVariables = this.setBiomartVariables.bind(this);
    this.setZoom = this.setZoom.bind(this);
    this.setZoomSmallMultiples = this.setZoomSmallMultiples.bind(this);
    this.setShowFilteredGenesAsDots = this.setShowFilteredGenesAsDots.bind(this);
    this.login = this.login.bind(this);
    this.toggleMainViewMode = this.toggleMainViewMode.bind(this);
    this.getMetadata = this.getMetadata.bind(this);
    this.getMetadataPromise = this.getMetadataPromise.bind(this);
    this.setPrimaryDataset = this.setPrimaryDataset.bind(this);
    this.redownloadData = this.redownloadData.bind(this);
    this.clearHighlight = this.clearHighlight.bind(this);
    this.setMaximumRenderedDots = this.setMaximumRenderedDots.bind(this);
    this.setRenderGeneInfoInSmallMultiples = this.setRenderGeneInfoInSmallMultiples.bind(this);
    this.getPCA = this.getPCA.bind(this);
    // Init datasethub and inject filterTriggered function
    this.datasetHub = new DatasetHub(this.filterBroadcasted, this.setBiomartVariables);
    this.debug = false;
    this.layoutFactory = new LayoutFactory(16);
    // Init NodeBridge and inject busystate functions
    this.nodeBridge = new NodeBridge(this.addBusyState, this.removeBusyState);
    // Authenticator takes nodebridge as input
    this.authentication = new Authentication(this.nodeBridge);
    // Set Authenticator object for the Node Bridge
    this.nodeBridge.setAuthentication(this.authentication);
    this.maxElementsForPCA = 2500; // Limit for POST getting the PCA dimensions
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
        left: false,
      },
      xDimension: '',
      yDimension: '',
      xTransformation: '-log10', // Default transformation on x axis
      yTransformation: 'linear', // Default transformation on y axis
      axisValues: 'untransformed', // Can be 'both', 'transformed' or 'untransformed'
      biomartVariables: {}, // Biomart variables maintained by DatasetHub
      zoom: true, // Zoom on filtering in the plots
      zoomSmallMultiples: false, // Zoom on filtering in the small multiple plots
      showFilteredGenesAsDots: true, // Show filtered genes as dots for small multiples
      maximumRenderedDots: 5000, // Maximum number of dots allowed for rendering
      renderGeneInfoInSmallMultiples: true, // Render GeneInfo pane also for small multiples
      highlight: new Highlight('EnsemblID', this.forceUpdateApp),
      viewMode: 'overview', // Steer the view mode of the main app
      toggleUpdate: true, // Dummy variable used for toggling an update in main app
      pcaLoading: false, // PCA is loading variable to steer icons of PCA plot
      pcaEnsemblIds: [], // EnsembleID variable to steer icons of PCA plot
    };
  }

  /**
   * Clear Highlight object
   */
  clearHighlight() {
    const highlight = this.state.highlight;
    highlight.clear();
    this.setState(highlight);
  }

  /**
   * Render GeneInfo in small multiples or not
   * @param {boolean} renderGeneInfoInSmallMultiples Render GeneInfo in small multiples
   */
  setRenderGeneInfoInSmallMultiples(renderGeneInfoInSmallMultiples) {
    this.setState({ renderGeneInfoInSmallMultiples });
  }

  /**
   * Set the maximum number of dots rendered in Hexplots
   * @param {integer} maximum Maximum dot number
   */
  setMaximumRenderedDots(maximum) {
    this.setState({ maximumRenderedDots: maximum });
  }

  /**
   * Set biomartVariables state function. Is maintained by DatasetHub function
   *
   * @param {object} biomartVariables Dictionary linking biomart variables to selection state
   */
  setBiomartVariables(biomartVariables) {
    this.setState(biomartVariables);
  }

  /**
   * Set primary data set based on name
   * @param {string} name Dataset name
   */
  setPrimaryDataset(name) {
    const dataset = this.datasetHub.datasets[name];
    // If dataset is undefined or it's data is undefined, do not load it
    if (isUndefined(dataset) || isUndefined(dataset.data)) {
      return;
    }
    this.setState({ primaryDataset: this.datasetHub.datasets[name] });
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
    const viewMode = this.state.viewMode === 'overview' ? 'detailed' : 'overview';
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
   * Should Small Multiple plots zoom into selection.
   * @param {boolean} zoomSmallMultiples Zoom status
   */
  setZoomSmallMultiples(zoomSmallMultiples) {
    this.setState({ zoomSmallMultiples });
  }

  /**
   * Should genes be rendered on filter
   * @param {boolean} showFilteredGenesAsDots Show filtered genes status
   */
  setShowFilteredGenesAsDots(showFilteredGenesAsDots) {
    this.setState({ showFilteredGenesAsDots });
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
      yDimension,
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
      yDimension: lastXDimension,
    });
  }

  /**
   * Toggle enabled status using `setEnableDataset`
   * @param {String} name Dataset name
   */
  toggleEnabledDataset(name) {
    this.setEnableDataset(name, !this.datasetHub.isEnabled(name));
  }

  redownloadData() {
    // TODO Implement
    console.log('Redownload data');
    // Get all dataset names
    const datasetNames = this.datasetHub.getDatasetNames();
    datasetNames.forEach((name) => {
      // Get dataset
      const dataset = this.datasetHub.getDataset(name);
      // if dataset is enabled, redownload it
      if (dataset.loading || dataset.loaded) {
        this.loadDataset(name, true);
      }
    });
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
      datasetEnabled: this.datasetHub.enabled,
    });
    // Update the count of the small multiples
    this.layoutFactory.setSmallMultiplesCount(this.datasetHub.getEnabledDatasetsCount() - 1);
    if (requiresLoading) {
      this.loadDataset(name);
    }
  }

  getMetadataPromise(name) {
    if (isUndefined(this.promises[name])) {
      this.promises[name] = this.getMetadata(name);
    }
    return this.promises[name];
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
    // We need to know if the file is public or private
    const isPublic = this.datasetHub.datasets[name].isPublic;
    const metadataResponse = await this.nodeBridge.getMetadata(name, isPublic);
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
      goTerms: this.goTermHub.sortGoTerms(goTerms),
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
      loginRequired,
    });
  }

  /**
   * Get PCA from node server
   */
  async getPCA() {
    // Get a list of filtered genes
    let ensemblIds = [];
    if (!isUndefined(this.state.primaryDataset.getData)) {
      // Get EnsemblIDs
      const primaryData = this.state.primaryDataset.getData();
      ensemblIds = objectValueToArray(primaryData, 'EnsemblID');
      // If all genes are filtered, return empty array
      ensemblIds = this.state.primaryDataset.getRowCount() === ensemblIds.length ? [] : ensemblIds;
      // If number of filtered genes is larger than the threshold, do nothing
      if (ensemblIds.length > this.maxElementsForPCA) {
        return;
      }
    }
    // Set loading flag to true
    this.setState({ pcaLoading: true });
    // Get PCA data
    const loadings = await this.nodeBridge.getPcaLoadings(
      'mmusculus_gene_ensembl',
      'current',
      ensemblIds,
    );
    // Set EnsemblIds
    this.setState({
      pca: loadings.loadings['.val'],
      pcaLoading: false,
      pcaEnsemblIds: ensemblIds,
    });
  }

  async initSession() {
    console.log('Starting testpost');
    await this.nodeBridge._fetchWithUserAndTokenPost('api/posttest', { message: 'Whoop whoop!' });
    // TODO: Clear existing session first, especially the loaded data sets
    // Check if we ned to login or not
    await this.checkLogin();
    // If we need to login, then there is no local user or token saved. Therefore initSession needs to exit
    if (this.state.loginRequired) return;

    // PCA Plot
    this.getPCA();
    this.getBiomartVariables();

    // Get GO-Term description
    // TODO: This "current" thing needs to go away, because this will change!
    this.goTermHub = new GoTermHub(this.nodeBridge.getGoSummary, this.nodeBridge.getGoPerGene);
    this.goTermHub.addGeneToGo('mmusculus_gene_ensembl', 'current');
    this.goTermHub.addSummary('mmusculus_gene_ensembl', 'current');
    // DEBUG
    // this.datasetHub.push(new Dataset('1043114.differential.csv'));
    // this.setEnableDataset('1043114.differential.csv', true);
    // Set default plotting dimensions
    this.setPlotDimensions('pValue', 'fc');

    // Load private and public data into the system
    this.loadData(true);
    this.loadData(false);
  }

  /**
   * Get Biomart variables from server and store them in the dataset hub
   */
  async getBiomartVariables() {
    const biomartVariablesResponse = await this.nodeBridge.getBiomartVariables(
      'mmusculus_gene_ensembl',
      'current',
    );
    const biomartVariables = biomartVariablesResponse.success
      ? biomartVariablesResponse.biomartVariables['.val']
      : ['Could not retreive from server'];
    this.datasetHub.setBiomartVariables(biomartVariables);
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
      // Set name, enabled status and public/private flag
      this.datasetHub.push(new Dataset(datasetName, false, !privateData));
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
    const response = await this.nodeBridge.sendRCommand(rpackage, rfunction, params, valformat);
    if (debug) console.log(response);

    // If Response is negative because of invalid token, invalidate login
    if (isUndefined(response.loginInvalid) && response.loginInvalid === true) {
      this.setState({ loginRequired: true });
    }
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
    const busy = this.state.busy;
    busy[busyKey] = true;
    this.setState({ busy });
  }

  /**
   * The busy state indicates that there are still requests made to the node back-end where no answers have been received yet.
   * This function removes a busy state with `busyKey` and updates the react state.
   *
   * @param {String} busyKey
   */
  removeBusyState(busyKey) {
    const busy = this.state.busy;
    delete busy[busyKey];
    this.setState({ busy });
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
      loginRequired: !loginSuccessful,
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
      'Entering Debug mode. Data will be loaded automatically. To disable, set `App.debug` to `false`',
    );
    // Set default plotting dimensions
    this.setPlotDimensions('pValueNegLog10', 'fc');
    // Login Required
    const loginRequired = await this.authentication.loginRequired();
    if (loginRequired) console.log('Login required');
    this.setState({
      loginRequired,
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
      toggleUpdate: !this.state.toggleUpdate,
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
    const response = await this.nodeBridge.getDataset(
      name,
      this.datasetHub.getBiomartVariablesSelected(),
      this.datasetHub.datasets[name].isPublic,
    );
    this.datasetHub.setData(
      name,
      response.dataset['.val'].dataset,
      response.dataset['.val'].dimNames,
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
    if (debug) {
      console.log(`Resize Window, width: ${window.innerWidth}, height: ${window.innerHeight}`);
    }
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
            padding: '10px',
          }}
        >
          <IconButton style={{ float: 'right' }} onClick={this.toggleLeftDrawer}>
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
        paddingLeft: this.state.openDrawer.left ? leftDrawerWidth : 0,
      },
    };
    // Create Hexplot dynamic from inbox data
    const hexplots = [];
    for (const name of this.datasetHub.names) {
      // Omit the primary dataset as small multiple if it is available
      if (!isUndefined(this.state.primaryDataset.data) && this.state.primaryDataset.name === name) {
        continue;
      }
      const dataset = this.datasetHub.datasets[name];
      if (dataset.loaded && dataset.enabled) {
        hexplots.push(
          <Grid item xs={6} key={name}>
            <Hexplot
              isSmallMultiple
              responsiveWidth
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
              setZoomSmallMultiples={this.setZoomSmallMultiples}
              setShowFilteredGenesAsDots={this.setShowFilteredGenesAsDots}
              xTransformation={this.state.xTransformation}
              yTransformation={this.state.yTransformation}
              zoom={this.state.zoomSmallMultiples}
              zoomSmallMultiples={this.state.zoomSmallMultiples}
              axisValues={this.state.axisValues}
              setAxisValues={this.setAxisValues}
              setPrimaryDataset={this.setPrimaryDataset}
              showFilteredGenesAsDots={this.state.showFilteredGenesAsDots}
              clearHighlight={this.clearHighlight}
              primaryDataset={this.state.primaryDataset}
              maximumRenderedDots={this.state.maximumRenderedDots}
              setMaximumRenderedDots={this.setMaximumRenderedDots}
              renderGeneInfoInSmallMultiples={this.state.renderGeneInfoInSmallMultiples}
              setRenderGeneInfoInSmallMultiples={this.setRenderGeneInfoInSmallMultiples}
            />
          </Grid>,
        );
      }
    }
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
              isSmallMultiple={false}
              height={this.layoutFactory.heights.mainView}
              width={600}
              responsiveWidth
              highlight={this.state.highlight}
              rnaSeqData={this.state.primaryDataset}
              xName={this.state.xDimension}
              yName={this.state.yDimension}
              filter={this.datasetHub.filter}
              forceUpdateApp={this.forceUpdateApp}
              hexSize={4}
              hexMax={20}
              showRenderGenesOption
              setTransformation={this.setTransformation}
              setZoom={this.setZoom}
              setZoomSmallMultiples={this.setZoomSmallMultiples}
              setShowFilteredGenesAsDots={this.setShowFilteredGenesAsDots}
              xTransformation={this.state.xTransformation}
              yTransformation={this.state.yTransformation}
              zoom={this.state.zoom}
              zoomSmallMultiples={this.state.zoomSmallMultiples}
              axisValues={this.state.axisValues}
              setAxisValues={this.setAxisValues}
              setPrimaryDataset={this.setPrimaryDataset}
              showFilteredGenesAsDots={this.state.showFilteredGenesAsDots}
              clearHighlight={this.clearHighlight}
              primaryDataset={this.state.primaryDataset}
              maximumRenderedDots={this.state.maximumRenderedDots}
              setMaximumRenderedDots={this.setMaximumRenderedDots}
              renderGeneInfoInSmallMultiples={this.state.renderGeneInfoInSmallMultiples}
              setRenderGeneInfoInSmallMultiples={this.setRenderGeneInfoInSmallMultiples}
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
              height={this.layoutFactory.heights.appView}
              responsiveWidth
              pca={this.state.pca}
              datasetHub={this.datasetHub}
              xPc={1}
              yPc={2}
              toggleEnabledDataset={this.toggleEnabledDataset}
              getMetadataPromise={this.getMetadataPromise}
              primaryDataset={this.state.primaryDataset}
              pcaLoading={this.state.pcaLoading}
              pcaEnsemblIds={this.state.pcaEnsemblIds}
              getPCA={this.getPCA}
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
            <div
              style={{
                maxWidth: `${this.layoutFactory.windowWidth / 2}px`,
                minWidth: `${this.layoutFactory.windowWidth / 3}px`,
                padding: '10px',
              }}
            >
              <IconButton style={{ float: 'right' }} onClick={this.toggleRightDrawer}>
                <Icon name="times" />
              </IconButton>
              <DatasetSelect
                getDatasetIcon={this.datasetHub.getDatasetIcon}
                setDatasetIcon={this.setDatasetIcon}
                datasetEnabled={this.state.datasetEnabled}
                datasetLoading={this.state.datasetLoading}
                setEnableDataset={this.setEnableDataset}
                datasetHub={this.datasetHub}
                setPrimaryDataset={this.setPrimaryDataset}
                primaryDataset={this.state.primaryDataset}
                getMetadataPromise={this.getMetadataPromise}
                redownloadData={this.redownloadData}
              />
            </div>
          </Drawer>
          <div
            style={{
              marginLeft: this.state.openDrawer.left ? leftDrawerWidth : 0,
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
