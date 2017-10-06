import React from 'react';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import TextField from 'material-ui/TextField';
import { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import { max } from 'd3-array';
import GoPlot from './GoPlot';
import { isUndefined } from './Helper';

const styleSheet = {
  'goOptionLabel': {
    marginTop: '16px'
  },
  'paperGo': {
    padding: '10px'
  },
  'formControl': { 
    margin: '10px'
  },
  'formNumPlots': {
    width: '45px'
  },
  'formTransfer': {
    width: '50px'
  },
  'colorBy': {
    minWidth: '100px'
  }
};

class GoPlotHub extends React.Component {

  constructor() {
    super();
    this.state = {
      debug: false,
      drawWholeGO: false,
      numberGoPlots: 50,
      numberMinIdsInGo: 10,
      numberTransferMin: -2,
      numberTransferMax: 2,
      dynamicTransDferFunction: false,
      colorByDimension: 'fc'
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
      if (goTerm['ids'].length < minIdsInGo)
        continue
      // Push the new goTerm
      filteredGoTerms.push(goTerm);
      // If the size exceeds maxPlots, break the for loop
      if (filteredGoTerms.length >= maxPlots)
        break;
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

  /**
   * Retrieve array of GoPlots based on input GO terms
   * @return {Array} Array of GoPlot elements
   */
  getGoPlots() {
    if (isUndefined(this.props.goTerms)) {
      return [];
    }

    const filteredGoTerms = this.filter(this.props.goTerms, this.state.numberMinIdsInGo, this.state.numberGoPlots);
    
    let maxGoTermSize;
    // Get the maximum GO size in the filtered GO terms
    if (this.state.drawWholeGO) {
      // If we want to draw the whole GO-terms, we have to get the summary of all of the filtered GO terms
      let filteredGoTermSummaries = [];
      for (const filteredGoTerm of filteredGoTerms) {
        filteredGoTermSummaries.push(this.props.goTermHub.summary[this.props.dataset.ensemblDataset][this.props.dataset.ensemblVersion][filteredGoTerm['goId']]);
      }
      maxGoTermSize = this.getMaxGoTermSize(Object.values(filteredGoTermSummaries), 'genes');
    } else {
      // Otherwise, just count the filtered ids per GO
      maxGoTermSize = this.getMaxGoTermSize(filteredGoTerms, 'ids');
    }
    if (this.state.debug) console.log(`maxGoTermSize: ${maxGoTermSize}`);
    // Iterate over goTerm elements
    // Restrict to 10 plots
    const goPlots = [];
    filteredGoTerms.forEach((goTerm) => {
      // Iterate over all datasets
      // this.props.datasetHub.datasets.forEach((dataset) => {

      // });
      const newGoPlot =
        (<GoPlot
          height={8}
          dataset={this.props.dataset}
          goTerm={goTerm}
          goTermSummary={
            this.props.goTermHub.summary[this.props.dataset.ensemblDataset][this.props.dataset.ensemblVersion][goTerm['goId']]
          }
          dimension={this.state.colorByDimension}
          icon={this.props.datasetHub.getDatasetIcon(this.props.dataset.name)}
          dimensionMin={this.state.numberTransferMin}
          dimensionMax={this.state.numberTransferMax}
          dimensionBoundariesDynamic={this.state.dynamicTransferFunction}
          drawWholeGO={this.state.drawWholeGO}
          highlight={this.props.highlight}
          forceUpdateApp={this.props.forceUpdateApp}
          maxGeneCount={maxGoTermSize}
          maxWidth={this.props.width - 160}
          key={`\
            Dataset ${this.props.dataset.name},\
            GoID ${goTerm.goId},\
            wholeGo ${this.state.drawWholeGO},\
            MinInGo: ${this.state.numberMinIdsInGo},\
            Min: ${this.state.numberTransferMin},\
            Max: ${this.state.numberTransferMax},\
            dynamic: ${this.state.dynamicTransferFunction},\
            dimension: ${this.state.colorByDimension}`}
        />);

      goPlots.push(newGoPlot);
    });
    return goPlots;
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
      <svg style={{ marginLeft: '5px', marginRight: '5px'}}width={width} height={height} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="Gradient1">
            <stop offset="0%" stopColor={disabled ? "gray" : "blue"} />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor={disabled ? "gray" : "#ee6351"} />
          </linearGradient>
        </defs>
        <rect rx="2" ry="2" width={width} height={height} fill="url(#Gradient1)" />
      </svg>
    )
  }

  /**
   * Get Menu items for Color-by Select
   * @return {array} Array of HTML Color-by elements
   */
  getMenuItems() {
    // Check if dataset is properly initialized
    if (isUndefined(this.props.dataset.getDimensionNames))
      return "";

    const dimensions = this.props.dataset.getDimensionNames();
    let menuItems = [];
    // Add Menu item for each dimension
    for (const dimension of dimensions)
      menuItems.push(
        <MenuItem
          key={`MenuItem Dimension ${dimension}`}
          value={dimension}
        >
          {dimension}
        </MenuItem>
      );

    return menuItems;
  }

  render() {
    if (this.state.debug && !isUndefined(this.props.goTerms)) { console.log("GoTerms:"); console.log(this.props.goTerms); }
    let toRender;
    if (isUndefined(this.props.goTermHub)) {
      toRender = <div>GO-Term Hub not initialized</div>
    }  else {
      toRender = 
        <div>
          <form noValidate autoComplete="off">
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Paper style={styleSheet.paperGo}>
                  <Grid container spacing={16}>
                    <Grid item xs={2}>
                      <Typography style={styleSheet.goOptionLabel} type="body2">GO-Plot General</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl>
                        <TextField
                          id="numberGoPlots"
                          label="#Plots"
                          value={this.state.numberGoPlots}
                          onChange={e => this.setState({ numberGoPlots: e.target.value })}
                          type="number"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl>
                        <TextField
                          id="numberMinIdsInGo"
                          label="#Mininum filtered"
                          value={this.state.numberMinIdsInGo}
                          onChange={e => this.setState({ numberMinIdsInGo: e.target.value })}
                          type="number"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={this.state.drawWholeGO}
                            onChange={(event, checked) => this.setState({ drawWholeGO: checked })}
                          />
                        }
                        label="Draw whole GO-Term"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper style={styleSheet.paperGo}>
                  <Grid container spacing={8}>
                    <Grid item xs={2}>
                      <Typography style={styleSheet.goOptionLabel} type="body2">Transfer Function</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Grid container spacing={8}>
                        {/* Gradient minimum and maximum */}
                        <Grid item xs={10} lg={6}>
                          <FormControl style={Object.assign(...styleSheet.formControl, styleSheet.formTransfer)}>
                            <TextField
                              disabled={this.state.dynamicTransferFunction}
                              id="numberTransferMin"
                              label="Min"
                              value={this.state.numberTransferMin}
                              onChange={e => this.setState({ numberTransferMin: e.target.value })}
                              type="number"
                            />
                          </FormControl>
                          {this.getGradient(this.state.dynamicTransferFunction, 100, 8)}
                          <FormControl style={Object.assign(...styleSheet.formControl, styleSheet.formTransfer)} >
                            <TextField
                              disabled={this.state.dynamicTransferFunction}
                              id="numberTransferMax"
                              label="Max"
                              value={this.state.numberTransferMax}
                              onChange={e => this.setState({ numberTransferMax: e.target.value })}
                              type="number"
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={5} lg={3}>
                          <FormControl>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={this.state.dynamicTransferFunction}
                                  onChange={(event, checked) => this.setState({ dynamicTransferFunction: checked })}
                                />
                              }
                              label="Dynamic Transfer"
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={5} lg={3}>
                          <FormControl>
                            <InputLabel>Color by</InputLabel>
                            <Select
                              value={this.state.colorByDimension}
                              onChange={event => this.setState({ colorByDimension: event.target.value })}
                            >
                              {this.getMenuItems()}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </form>
            {this.getGoPlots()}
        </div>;
    }
    return toRender;
  }
}

export default GoPlotHub;
