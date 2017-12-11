import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import { Icon } from 'react-fa';
import Loading from './Loading';
import IconSelect from './IconSelect';
import DatasetInfo from './DatasetInfo';
import BiomartVariablePicker from './BiomartVariablePicker';

const styleSheet = {
  primaryDatasetIcon: {
    fontSize: '130%',
    color: '#EE6351',
  },
  standardDatasetIcon: {
    fontSize: '90%',
    color: 'gray',
  },
};

class DatasetSelect extends React.Component {
  constructor() {
    super();
    this.state = {
      tooltip: '',
      biomartVariablePickerVisible: true,
      myDatasetsVisible: true,
      publicDatasetsVisible: false,
    };
  }

  getCheckboxes(mode = 'public') {
    const datasetCheckboxes = [];
    const datasets = Object.keys(this.props.datasetEnabled);
    // for (const datasetName of Object.keys(this.props.datasetEnabled)) {
    datasets.forEach((datasetName, index) => {
      // Check if we should render public or private data
      if (mode === 'public' && !this.props.datasetHub.datasets[datasetName].isPublic) {
        return;
      }
      if (mode === 'private' && this.props.datasetHub.datasets[datasetName].isPublic) {
        return;
      }
      // Check if the data is public and if not enabled, don't add it
      if (mode === 'public' && !this.props.datasetEnabled[datasetName]) {
        return;
      }
      datasetCheckboxes.push(
        <ListItem
          dense
          button
          key={`DatasetSelect_${datasetName}`}
          onClick={() =>
            this.props.setEnableDataset(datasetName, !this.props.datasetEnabled[datasetName])
          }
          onMouseLeave={() => this.setState({ tooltip: [] })}
          onMouseOver={(event) => {
            // Add tooltip event
            const tooltip = [];
            const metadata = this.props.getMetadataPromise(datasetName);
            const domNode = ReactDOM.findDOMNode(this);
            tooltip.push(
              <div
                key={`tooltip datasetselect ${datasetName}`}
                style={{
                  position: 'absolute',
                  top: event.clientY - domNode.getBoundingClientRect().top + 15,
                  marginLeft: 40,
                }}
              >
                <DatasetInfo metadata={metadata} name={datasetName} />
              </div>,
            );
            this.setState({ tooltip });
          }}
        >
          <Checkbox
            onChange={(event, checked) => this.props.setEnableDataset(datasetName, checked)}
            checked={this.props.datasetEnabled[datasetName]}
            disabled={this.props.datasetLoading[datasetName]}
          />
          <ListItemText primary={`Name: ${datasetName}`} />
          {/* Icon indicating primary dataset */}
          <IconButton
            aria-owns="simple-menu"
            style={
              this.props.primaryDataset.name === datasetName
                ? styleSheet.primaryDatasetIcon
                : styleSheet.standardDatasetIcon
            }
            onClick={(event) => {
              event.stopPropagation();
              this.props.setPrimaryDataset(datasetName);
            }}
          >
            <Icon name="check-circle-o" />
          </IconButton>

          <IconSelect
            defaultIconID={index}
            datasetName={datasetName}
            setDatasetIcon={this.props.setDatasetIcon}
            getDatasetIcon={this.props.getDatasetIcon}
          />
        </ListItem>,
      );
    });
    if (datasetCheckboxes.length === 0) {
      datasetCheckboxes.push(<Loading key="CircularProgress_getCheckboxes" />);
    }

    return datasetCheckboxes;
  }

  /**
   * Render Biomart variable picker component
   */
  renderBiomartVariablePicker() {
    return (
      <BiomartVariablePicker
        biomartVariables={this.props.datasetHub.getBiomartVariables()}
        setBiomartVariableSelection={this.props.datasetHub.setBiomartVariableSelection}
        redownloadData={this.props.redownloadData}
      />
    );
  }

  renderExpandableContainer(isVisible, content, headerName, onClick) {
    return (
      <div>
        <Typography onClick={onClick} style={{ cursor: 'pointer' }} type="headline" gutterBottom>
          {isVisible ? `▾ ${headerName}` : `▸ ${headerName}`}
        </Typography>
        {isVisible ? content : ''}
      </div>
    );
  }

  render() {
    const checkboxesPrivate = this.getCheckboxes('private');
    const checkboxesPublic = this.getCheckboxes('public');
    return (
      <div>
        {this.renderExpandableContainer(
          this.state.biomartVariablePickerVisible,
          this.renderBiomartVariablePicker(),
          'Biomart Variables',
          () => {
            this.setState({
              biomartVariablePickerVisible: !this.state.biomartVariablePickerVisible,
            });
          },
        )}
        {this.renderExpandableContainer(
          this.state.myDatasetsVisible,
          <Paper>
            <List>{checkboxesPrivate}</List>
          </Paper>,
          'My Datasets',
          () => {
            this.setState({
              myDatasetsVisible: !this.state.myDatasetsVisible,
            });
          },
        )}
        {this.renderExpandableContainer(
          this.state.publicDatasetsVisible,
          <Paper>
            <List>{checkboxesPublic}</List>
          </Paper>,
          'Public Datasets',
          () => {
            this.setState({
              publicDatasetsVisible: !this.state.publicDatasetsVisible,
            });
          },
        )}
        {this.state.tooltip}
        <div style={{ height: '600px' }} />
      </div>
    );
  }
}

DatasetSelect.propTypes = {
  datasetEnabled: PropTypes.object,
  datasetLoading: PropTypes.object,
  setEnableDataset: PropTypes.func,
  setDatasetIcon: PropTypes.func,
  getDatasetIcon: PropTypes.func,
};

export default DatasetSelect;
