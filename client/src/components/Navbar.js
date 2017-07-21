import React from 'react';
import Logo from './Logo';
import Grid from 'material-ui/Grid';

const styleSheet = {
  navbar: {
    marginBottom: '50px',
    marginTop: '50px',
  },
  button: {
    color: '#333',
    fontFamily: "Helvetica Neue",
    fontSize: '11pt',
    cursor: 'pointer'
  },
  buttons: {
    textAlign: 'right'
  }
};

class Navbar extends React.Component {
	render() {
		return(
      <div style={styleSheet.navbar}>
        <Grid container gutter={24}>
          <Grid item xs={1}></Grid>
          <Grid item xs={5}>
            <Logo pulse={true}></Logo>
          </Grid>
          <Grid item xs={5} style={styleSheet.buttons}>
            <a style={styleSheet.button} onClick={this.props.toggleRightDrawer}>Show datasets</a>
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </div>
		);
	}
}

export default Navbar;