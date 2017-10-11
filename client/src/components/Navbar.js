import React from 'react';
import Logo from './Logo';
import Grid from 'material-ui/Grid';

const styleSheet = {
  navbar: {
    marginBottom: '60px',
    marginTop: '40px',
  },
  button: {
    color: '#333',
    fontFamily: "Helvetica Neue",
    fontSize: '11pt',
    cursor: 'pointer',
    marginRight: '30px'
  },
  buttons: {
    textAlign: 'right'
  }
};

class Navbar extends React.Component {
  render() {
    return(
      <div style={styleSheet.navbar}>
        <Grid container spacing={24}>
          <Grid item xs={1}></Grid>
          <Grid item xs={2}>
            <Logo pulse={ this.props.busy }></Logo>
          </Grid>
          <Grid item xs={8} style={styleSheet.buttons}>
            <a style={styleSheet.button} onClick={this.props.toggleLeftDrawer}>Show GO-Terms</a>
            <a style={styleSheet.button} onClick={this.props.toggleRightDrawer}>Show datasets</a>
            <a style={styleSheet.button} onClick={this.props.invalidateLogin}>Logout</a>
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </div>
    );
  }
}

export default Navbar;