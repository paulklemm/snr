import React from 'react';
import { FormControl } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { max } from 'd3-array';
import FlipMove from 'react-flip-move';
// Options Pane
import { Icon } from 'react-fa';
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader
} from 'material-ui/List';
// Own imports
import GoPlot from './GoPlot';
import { isUndefined } from './Helper';

const styleSheet = {
  goOptionLabel: {
    marginTop: '16px'
  },
  paperGo: {
    padding: '10px'
  },
  formControl: {
    margin: '10px'
  },
  formNumPlots: {
    width: '45px'
  },
  formTransfer: {
    width: '50px'
  },
  colorBy: {
    minWidth: '100px'
  },
  goPlotSummaryPaper: {
    padding: '10px',
    marginTop: '2px',
    marginBottom: '2px'
  }
};

class GoPlotHub extends React.Component {
  constructor() {
    super();
    this.toggleGOTerm = this.toggleGOTerm.bind(this);
    this.state = {
      debug: false,
      drawWholeGO: false,
      numberGoPlots: 50,
      numberMinIdsInGo: 10,
      numberTransferMin: -2,
      numberTransferMax: 2,
      dynamicTransferFunction: false,
      colorByDimension: 'fc',
      selectedGoTerms: {}
    };
  }

  /**
   * Filter GO-terms based on size and number of plots
   *
   * @param {array} goTerms List of goTerm objects
   * @param {integer} minIdsInGo Minimum count of filtered Ids in GO-term
   * @param {integer} maxPlots Maximum number of plotted GO-terms
   * @return {array} Filtered list of goTerms
   */
  filter(goTerms, minIdsInGo, maxPlots) {
    let filteredGoTerms = [];
    // Iterate over GO terms and check if they satisfy the criteria
    for (const goTerm of goTerms) {
      // Check for minimum size
      if (goTerm['ids'].length < minIdsInGo) continue;
      // Push the new goTerm
      filteredGoTerms.push(goTerm);
      // If the size exceeds maxPlots, break the for loop
      if (filteredGoTerms.length >= maxPlots) break;
    }
    // Set the global variable
    return filteredGoTerms;
  }

  /**
   * Determine the largest 'ids' array in a set of GO-terms
   * Format:
   * [1]:Object {ids: Array(36), percentage: 18, goId: "GO:0090049"}
   * [2]:Object {ids: Array(38), percentage: 12.666666666666666, goId: "GO:0050816"}
   * [3]:Object {ids: Array(38), percentage: 12.666666666666666, goId: "GO:1990452"}
   * [4]:Object {ids: Array(37), percentage: 12.333333333333334, goId: "GO:1903378"}
   * 
   * @param {array} goTerms Array of goTerms to determin max size for
   * @return {integer} Size of largest go-Term in the array
   */
  getMaxGoTermSize(goTerms, arrayMember) {
    const goTermsSizes = [];
    goTerms.forEach(goTerm => {
      goTermsSizes.push(goTerm[arrayMember].length);
    });
    return max(goTermsSizes);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (!isUndefined(this.props.goTerms) && !isUndefined(nextProps.goTerms)) {
  //     const currentFilteredGoTerms = this.filter(
  //       this.props.goTerms,
  //       this.state.numberMinIdsInGo,
  //       this.state.numberGoPlots
  //     );
  //     const newFilteredGoTerms = this.filter(
  //       nextProps.goTerms,
  //       nextState.numberMinIdsInGo,
  //       nextState.numberGoPlots
  //     );
  //     if (currentFilteredGoTerms.length !== newFilteredGoTerms.length) { return true; }
  //     for (const { item, index } of toItemIndexes(currentFilteredGoTerms)) {
  //       const itemGoId = item.goId;
  //       const newItemGoId = newFilteredGoTerms[index].goId;
  //       if (itemGoId !== newItemGoId) {
  //         console.log('Update: Item mismatch, return true');
  //         return true;
  //       }
  //     }
  //     console.log('Update: returning false');
  //     return false;
  //   }
  //   console.log("GoPlothub should update");
  //   return true;
  // }

  /**
   * Toggle GO-Term used in OnClick function in GoPlots. If it is toggled, render it for all datasets
   *
   * @param {String} goTermName Name of GO term to toggle
   */
  toggleGOTerm(goTermName) {
    const selectedGoTerms = this.state.selectedGoTerms;
    if (selectedGoTerms[goTermName] === true) {
      delete selectedGoTerms[goTermName];
    } else {
      selectedGoTerms[goTermName] = true;
    }
    this.setState({ selectedGoTerms });
  }

  /**
   * Retrieve array of GoPlots based on input GO terms
   * @return {Array} Array of GoPlot elements
   */
  getGoPlots() {
    if (isUndefined(this.props.goTerms)) {
      return [];
    }

    const filteredGoTerms = this.filter(
      this.props.goTerms,
      this.state.numberMinIdsInGo,
      this.state.numberGoPlots
    );
    let maxGoTermSize;
    // Get the maximum GO size in the filtered GO terms
    if (this.state.drawWholeGO) {
      // If we want to draw the whole GO-terms, we have to get the summary of all of the filtered GO terms
      let filteredGoTermSummaries = [];
      for (const filteredGoTerm of filteredGoTerms) {
        filteredGoTermSummaries.push(
          this.props.goTermHub.summary[this.props.dataset.ensemblDataset][
            this.props.dataset.ensemblVersion
          ][filteredGoTerm['goId']]
        );
      }
      maxGoTermSize = this.getMaxGoTermSize(
        Object.values(filteredGoTermSummaries),
        'genes'
      );
    } else {
      // Otherwise, just count the filtered ids per GO
      maxGoTermSize = this.getMaxGoTermSize(filteredGoTerms, 'ids');
    }
    if (this.state.debug) console.log(`maxGoTermSize: ${maxGoTermSize}`);
    // Iterate over goTerm elements
    const goPlots = [];
    filteredGoTerms.forEach(goTerm => {
      // Check if the goTerm is selected, if so render it for all datasets
      if (this.state.selectedGoTerms[goTerm.goId] === true) {
        // Attach GO-Term information
        const currentSummary = this.props.goTermHub.summary[
          this.props.dataset.ensemblDataset
        ][this.props.dataset.ensemblVersion][goTerm['goId']];
        const url = `http://amigo.geneontology.org/amigo/term/${goTerm.goId}`;
        const summaryTable = (
          <table className="gosummarytable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Definition</td>
                <td>{currentSummary.go_term_definition}</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>{currentSummary.go_term_name}</td>
              </tr>
              <tr>
                <td>Domain</td>
                <td>{currentSummary.go_domain}</td>
              </tr>
              <tr>
                <td>Filtered Gene Count</td>
                <td>{`${goTerm.ids
                  .length}/${currentSummary.count_genes}(${Math.round(
                  parseFloat(goTerm.percentage) * 100
                )}%)`}</td>
              </tr>
              <tr>
                <td>Transcript Count</td>
                <td>{currentSummary.count_transcripts}</td>
              </tr>
              <tr>
                <td>Link</td>
                <td>
                  <a target="_blank" href={url}>
                    {url}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        );
        // Iterate over all datasets
        const goPlotsPerDataset = [];
        Object.values(this.props.datasetHub.datasets).forEach(dataset => {
          if (dataset.loaded) {
            goPlotsPerDataset.push(
              this.getGoPlot(dataset, goTerm, maxGoTermSize, true)
            );
          }
        });
        // Push the table and GoPlots to a paper element
        goPlots.push(
          <Paper
            style={styleSheet.goPlotSummaryPaper}
            key={`${goTerm.goId} Summary Paper`}
          >
            <Typography
              type="subheading"
              style={{ cursor: 'pointer' }}
              gutterBottom
              onClick={() => this.toggleGOTerm(goTerm.goId)}
            >
              {goTerm.goId}
            </Typography>
            {summaryTable}
            {goPlotsPerDataset}
          </Paper>
        );
        // If not, add the standard dataset
      } else {
        goPlots.push(this.getGoPlot(this.props.dataset, goTerm, maxGoTermSize));
      }
    });

    // For whole-GO term drawings, animations are too slow, so disable them.
    if (this.shouldAnimate()) {
      return (
        <FlipMove duration={150} easing="ease-out">
          {goPlots}
        </FlipMove>
      );
    }
    // No animation return
    return goPlots;
  }

  /**
   * Checks parameters determining whether we should animate or not
   * @return {boolean} Should include animations
   */
  shouldAnimate() {
    // For whole-GO term drawings, animations are too slow, so disable them.
    return !this.state.drawWholeGO;
  }

  /**
   * Represent GO-term instance using the GoPlot class
   *
   * @param {Dataset} dataset to render
   * @param {Object} goTerm to render
   * @param {integer} maxGoTermSize maximum width of the go term
   * @param {boolean} drawIcon draw the icon of the data set or not
   * @return {JSX.Element} GoPlot instance representing the GO-term
   */
  getGoPlot(dataset, goTerm, maxGoTermSize, drawIcon = false) {
    return (
      <GoPlot
        height={8}
        dataset={dataset}
        goTerm={goTerm}
        goTermSummary={
          this.props.goTermHub.summary[dataset.ensemblDataset][
            dataset.ensemblVersion
          ][goTerm['goId']]
        }
        dimension={this.state.colorByDimension}
        icon={this.props.datasetHub.getDatasetIcon(dataset.name)}
        drawIcon={drawIcon}
        dimensionMin={this.state.numberTransferMin}
        dimensionMax={this.state.numberTransferMax}
        dimensionBoundariesDynamic={this.state.dynamicTransferFunction}
        drawWholeGO={this.state.drawWholeGO}
        highlight={this.props.highlight}
        forceUpdateApp={this.props.forceUpdateApp}
        maxGeneCount={maxGoTermSize}
        toggleGOTerm={this.toggleGOTerm}
        maxWidth={this.props.width - 160}
        animated={this.shouldAnimate()}
        key={`\
            Dataset ${dataset.name},\
            GoID ${goTerm.goId},\
            wholeGo ${this.state.drawWholeGO},\
            MinInGo: ${this.state.numberMinIdsInGo},\
            Min: ${this.state.numberTransferMin},\
            Max: ${this.state.numberTransferMax},\
            dynamic: ${this.state.dynamicTransferFunction},\
            dimension: ${this.state.colorByDimension}`}
      />
    );
  }

  /**
   * Get static linear gradient rect for UI to adjust transfer function
   * 
   * @param {boolean} disabled Print element as disabled or not
   * @param {integer} width Width of element in pixel
   * @param {integer} height Height of element in pixel
   * @return {html} SVG element containing the gradient
   */
  getGradient(disabled = false, width, height) {
    return (
      <svg
        style={{ marginLeft: '5px', marginRight: '5px' }}
        width={width}
        height={height}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="Gradient1">
            <stop offset="0%" stopColor={disabled ? 'gray' : 'blue'} />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor={disabled ? 'gray' : '#ee6351'} />
          </linearGradient>
        </defs>
        <rect
          rx="2"
          ry="2"
          width={width}
          height={height}
          fill="url(#Gradient1)"
        />
      </svg>
    );
  }

  /**
   * Get Menu items for Color-by Select
   * @return {array} Array of HTML Color-by elements
   */
  getMenuItems() {
    // Check if dataset is properly initialized
    if (isUndefined(this.props.dataset.getDimensionNames)) return '';

    const dimensions = this.props.dataset.getDimensionNames();
    let menuItems = [];
    // Add Menu item for each dimension
    for (const dimension of dimensions)
      menuItems.push(
        <MenuItem key={`MenuItem Dimension ${dimension}`} value={dimension}>
          {dimension}
        </MenuItem>
      );

    return menuItems;
  }

  getOptionsPane() {
    return (
      <Paper>
        <List subheader={<ListSubheader>Settings</ListSubheader>}>
          <ListItem>
            <ListItemIcon>
              <Icon name="bar-chart-o" />
            </ListItemIcon>
            <ListItemText primary="Number of GO Plots" />
            <ListItemSecondaryAction>
              <TextField
                id="numberGoPlots"
                label="# Plots"
                value={this.state.numberGoPlots}
                onChange={e => this.setState({ numberGoPlots: e.target.value })}
                type="number"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Icon name="bar-chart-o" />
            </ListItemIcon>
            <ListItemText primary="Minimum #filtered" />
            <ListItemSecondaryAction>
              <TextField
                id="numberMinIdsInGo"
                label="# Mininum"
                value={this.state.numberMinIdsInGo}
                onChange={e =>
                  this.setState({ numberMinIdsInGo: e.target.value })}
                type="number"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Icon name="bar-chart-o" />
            </ListItemIcon>
            <ListItemText primary="Draw whole GO-Term" />
            <ListItemSecondaryAction>
              <Switch
                checked={this.state.drawWholeGO}
                onChange={(event, checked) =>
                  this.setState({ drawWholeGO: checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListSubheader>Transfer Function</ListSubheader>
          {/* Dynamic transfer function */}
          <ListItem>
            <ListItemIcon>
              <Icon name="bar-chart-o" />
            </ListItemIcon>
            <ListItemText primary="Dynamic transfer function" />
            <ListItemSecondaryAction>
              <Switch
                checked={this.state.dynamicTransferFunction}
                onChange={(event, checked) =>
                  this.setState({ dynamicTransferFunction: checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {/* Color-encoding dimension */}
          <ListItem>
            <ListItemIcon>
              <Icon name="bar-chart-o" />
            </ListItemIcon>
            <ListItemText primary="Color-encoding dimension" />
            <ListItemSecondaryAction>
              <Select
                value={this.state.colorByDimension}
                onChange={event =>
                  this.setState({ colorByDimension: event.target.value })}
              >
                {this.getMenuItems()}
              </Select>
            </ListItemSecondaryAction>
          </ListItem>
          {/* Transfer */}
          <ListItem>
            <ListItemIcon>
              <Icon name="bar-chart-o" />
            </ListItemIcon>
            <ListItemText primary="Transfer" />
            <ListItemSecondaryAction>
              <FormControl
                style={Object.assign(
                  ...styleSheet.formControl,
                  styleSheet.formTransfer
                )}
              >
                <TextField
                  disabled={this.state.dynamicTransferFunction}
                  id="numberTransferMin"
                  label="Min"
                  value={this.state.numberTransferMin}
                  onChange={e =>
                    this.setState({ numberTransferMin: e.target.value })}
                  type="number"
                />
              </FormControl>
              {this.getGradient(this.state.dynamicTransferFunction, 100, 8)}
              <FormControl
                style={Object.assign(
                  ...styleSheet.formControl,
                  styleSheet.formTransfer
                )}
              >
                <TextField
                  disabled={this.state.dynamicTransferFunction}
                  id="numberTransferMax"
                  label="Max"
                  value={this.state.numberTransferMax}
                  onChange={e =>
                    this.setState({ numberTransferMax: e.target.value })}
                  type="number"
                />
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    );
  }

  render() {
    if (this.state.debug && !isUndefined(this.props.goTerms)) {
      console.log('GoTerms:');
      console.log(this.props.goTerms);
    }
    let toRender;
    if (isUndefined(this.props.goTermHub)) {
      toRender = <div>GO-Term Hub not initialized</div>;
    } else {
      const goPlots = this.getGoPlots();
      console.log(`GoPlots Length: ${goPlots.length}`);
      toRender = (
        <div>
          <div style={{ marginTop: '60px' }}>{this.getOptionsPane()}</div>
          <Typography
            style={{ marginTop: '20px' }}
            type="headline"
            gutterBottom
          >
            GO-Terms
          </Typography>
          <div
            style={{
              marginTop: '10px'
            }}
          >
            {goPlots}
          </div>
        </div>
      );
    }
    return toRender;
  }
}

export default GoPlotHub;
