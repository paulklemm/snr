import React from 'react';
import { isUndefined } from './Helper';
import Loading from './Loading';

class DatasetInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      metadata: undefined
    };
  }

  /**
   * Await metadata promise
   */
  async getMetadata() {
    const metadata = await this.props.metadata;
    this.setState({
      metadata
    });
  }

  componentDidMount() {
    this.getMetadata();
  }

  render() {
    // Get metadata for the dataset
    console.log(`Render DatasetInfo. Metadata`);
    console.log(this.state.metadata);
    return isUndefined(this.state.metadata) ? <Loading /> : <div>DatasetInfo</div>;
  }
}

export default DatasetInfo;
