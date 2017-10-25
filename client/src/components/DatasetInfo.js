import React from 'react';
import { isUndefined } from './Helper';
import Paper from 'material-ui/Paper';

class DatasetInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      metadata: undefined,
    };
  }

  /**
   * Await metadata promise
   */
  async getMetadata() {
    const metadata = await this.props.metadata;
    this.setState({
      metadata,
    });
  }

  componentDidMount() {
    this.getMetadata();
  }

  /**
   * Generate table from metadata
   * @param {object} data Metadata for table generation
   * @return {jsx} Metadata table
   */
  getDatasetInfoTable(data) {
    return (
      <table className="gosummarytable">
        <thead>
          <tr>
            <th>Name</th>
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
    // Get metadata for the dataset
    let body;
    if (isUndefined(this.state.metadata)) {
      body = (
        <div className="smalltext" style={{ minWidth: '100px' }}>
          Let me get get this for you quickly{' '}
          <span role="img" aria-label="Hell Yeah">
            💪🏽
          </span>
        </div>
      );
    } else {
      body = this.getDatasetInfoTable(this.state.metadata);
    }
    // Return the body wrapped into a Paper component
    return (
      <Paper
        style={{
          padding: '10px',
          display: 'inline-block',
        }}
      >
        <div style={{ marginBottom: '10px' }}>{this.props.name}</div>
        {body}
      </Paper>
    );
  }
}

export default DatasetInfo;
