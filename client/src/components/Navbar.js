import React from 'react';
import Grid from 'material-ui/Grid';
import { Icon } from 'react-fa';
import Logo from './Logo';

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
          {<Grid item xs={1}></Grid>}
          <Grid item xs={2}>
            <Logo pulse={ this.props.busy }></Logo>
          </Grid>
          <Grid item xs={8} style={styleSheet.buttons}>
            <a style={styleSheet.button} onClick={this.props.toggleLeftDrawer}>
              <Icon name="pie-chart" /> Show GO-Terms
            </a>
            <a style={styleSheet.button} onClick={this.props.toggleRightDrawer}>
              <Icon name="table" /> Show datasets
            </a>
            <a style={styleSheet.button} onClick={this.props.invalidateLogin}>
              <Icon name="sign-out" /> Logout
            </a>
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </div>
    );
  }
}

export default Navbar;