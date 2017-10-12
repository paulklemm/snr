import React from 'react';
import Typography from 'material-ui/Typography';

class Welcome extends React.Component {
  render() {
    return(
      <div 
        style={{
          textAlign: 'center'
        }}
      >
        <Typography type="subheading" gutterBottom>
          Welcome to Sonar! Please choose a dataset by clicking on "Show datasets".
        </Typography>
      </div>
    );
  }
}

export default Welcome;
