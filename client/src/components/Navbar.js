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
    // Rather lengthy code to choose text and icon for main view
    const cloudIcon = <Icon name="cloud" />;
    const searchIcon = <Icon name="search" />;
    let mainViewIcon;
    let mainText;
    if (this.props.mainViewMode === 'overview') {
      mainViewIcon = searchIcon;
      mainText = 'Small Multiples View';
    } else {
      mainViewIcon = cloudIcon;
      mainText = 'Overview';
    }

    return(
      <div style={styleSheet.navbar}>
        <Grid container spacing={24}>
          <Grid item xs={1}></Grid>
          <Grid item xs={2}>
            <Logo pulse={ this.props.busy }></Logo>
          </Grid>
          <Grid item xs={8} style={styleSheet.buttons}>
            <a style={styleSheet.button} onClick={this.props.toggleMainViewMode}>
              {mainViewIcon} {mainText}
            </a>
            <a style={styleSheet.button} onClick={this.props.toggleLeftDrawer}>
              <Icon name="pie-chart" /> GO-Terms
            </a>
            <a style={styleSheet.button} onClick={this.props.toggleRightDrawer}>
              <Icon name="table" /> Datasets
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

  componentWillReceiveProps(nextProps) {
    
  }
}

export default Navbar;