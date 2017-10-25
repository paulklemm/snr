import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import { Icon } from 'react-fa';
import Loading from './Loading';
import IconSelect from './IconSelect';
import DatasetInfo from './DatasetInfo';

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
    };
  }

  getCheckboxes(mode = 'public') {
    const datasetCheckboxes = [];
    let index = 0;
    for (const datasetName of Object.keys(this.props.datasetEnabled)) {
      // Check if we should render public or private data
      if (mode === 'public' && !this.props.datasetHub.datasets[datasetName].isPublic) {
        continue;
      }
      if (mode === 'private' && this.props.datasetHub.datasets[datasetName].isPublic) {
        continue;
      }
      datasetCheckboxes.push(
        <ListItem
          dense
          button
          key={`DatasetSelect_${datasetName}`}
          onClick={() =>
            this.props.setEnableDataset(datasetName, !this.props.datasetEnabled[datasetName])}
          onMouseLeave={() => this.setState({ tooltip: [] })}
          onMouseOver={(event) => {
            // Add tooltip event
            const tooltip = [];
            const metadata = this.props.getMetadataPromise(datasetName);
            tooltip.push(
              <div
                key={`tooltip datasetselect ${datasetName}`}
                style={{
                  position: 'absolute',
                  top: event.clientY + 15,
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
      index += index;
    }
    if (datasetCheckboxes.length === 0) {
      datasetCheckboxes.push(<Loading key="CircularProgress_getCheckboxes" />);
    }

    return datasetCheckboxes;
  }

  render() {
    const checkboxesPrivate = this.getCheckboxes('private');
    const checkboxesPublic = this.getCheckboxes('public');
    return (
      <div>
        <Typography type="headline" gutterBottom>
          My Datasets
        </Typography>
        <List>{checkboxesPrivate}</List>
        <Typography type="headline" gutterBottom>
          Public Datasets
        </Typography>
        <List>{checkboxesPublic}</List>
        {this.state.tooltip}
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
