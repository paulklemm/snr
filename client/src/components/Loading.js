import React from 'react';
import { CircularProgress } from 'material-ui/Progress';
import { isUndefined } from './Helper';

class Loading extends React.Component{
  render() {
    const label = !isUndefined(this.props.label) ?
      <div style={{ marginLeft: '20px' }}> {this.props.label} </div> : '';

    return (
      <div style={{
        width: `${this.props.width}px`,
        height: `${this.props.height}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      >
        <CircularProgress />
        {label}
      </div>
    );
  }
}

export default Loading;
