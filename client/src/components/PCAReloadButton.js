import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import RefreshIcon from 'material-ui-icons/Refresh';
import { CircularProgress } from 'material-ui/Progress';
import { isUndefined, objectValueToArray, areIdentical } from './Helper';

class PCAPlotReloadButton extends React.Component {
  /**
   * Can PCA plot be reloaded?
   * @param {Dataset} dataset Primary dataset
   * @param {array} filteredEnsemblIds array of filtered datasets
   * @return {boolean} PCA plot can be rerendered
   */
  static pcaPlotRequiresReload(dataset, filteredEnsemblIds, previouslyFilteredEnsemblIds) {
    // If there is no primary data available, no reload is required
    if (isUndefined(dataset.data)) {
      return false;
    }
    // Check if all ensemblIDs are selected
    if (
      filteredEnsemblIds.length === dataset.getRowCount() &&
      previouslyFilteredEnsemblIds.length === 0
    ) {
      return false;
    }
    // Check if the ensemblIds match the previously selected ones
    return !areIdentical(filteredEnsemblIds, previouslyFilteredEnsemblIds);
  }

  render() {
    // PCA IDs
    let pcaPlotRequiresReload = false;
    let pcaIDsLabel = 'All IDs';
    if (!isUndefined(this.props.primaryDataset.data)) {
      // If the count of ensemblIds is smaller than the total size of the dataset, print count
      const filteredEnsemblIds = objectValueToArray(
        this.props.primaryDataset.getData(),
        'EnsemblID',
      );
      // Get reload status
      pcaPlotRequiresReload = PCAPlotReloadButton.pcaPlotRequiresReload(
        this.props.primaryDataset,
        filteredEnsemblIds,
        this.props.pcaEnsemblIds,
      );
      // Get label
      if (filteredEnsemblIds.length < this.props.primaryDataset.getRowCount()) {
        pcaIDsLabel = `${filteredEnsemblIds.length} IDs`;
      }
    }
    // If reload is required, append text
    pcaIDsLabel = pcaPlotRequiresReload ? `${pcaIDsLabel} (reload)` : pcaIDsLabel;

    return (
      <div
        style={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
        }}
      >
        <Button
          fab
          color="primary"
          disabled={this.props.pcaLoading || !pcaPlotRequiresReload}
          onClick={this.props.getPCA}
        >
          <RefreshIcon />
        </Button>
        {this.props.pcaLoading && (
          <CircularProgress
            size={68}
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              zIndex: 1,
            }}
          />
        )}
        <div style={{ marginLeft: '10px' }}>
          <span style={pcaPlotRequiresReload ? { color: 'gray' } : {}}>{pcaIDsLabel}</span>
        </div>
      </div>
    );
  }
}

PCAPlotReloadButton.propTypes = {
  pcaLoading: PropTypes.bool,
  primaryDataset: PropTypes.object,
  pcaEnsemblIds: PropTypes.array,
  getPCA: PropTypes.func,
};

export default PCAPlotReloadButton;
