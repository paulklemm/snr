import React from 'react';
import Paper from 'material-ui/Paper';

class GeneInfo extends React.Component {
  /**
   * Generate table from metadata. Method from `DatasetInfo.js`
   * @param {object} data Metadata for table generation
   * @return {jsx} Metadata table
   */
  getDatasetInfoTable(data) {
    return (
      <table className="gosummarytable">
        <thead>
          <tr>
            <th>Name</th>2
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((key, index) => {
            const value = data[key];
            return (
              <tr key={`${key}, ${index}`}>
                <td>{key}</td>
                <td>{value.toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  render() {
    const body = this.getDatasetInfoTable(this.props.geneEntry);
    return (
      <Paper
        onMouseLeave={() => this.props.clearHighlight()}
        style={{
          padding: '10px',
          display: 'inline-block',
        }}
      >
        {body}
      </Paper>
    );
  }
}

export default GeneInfo;
