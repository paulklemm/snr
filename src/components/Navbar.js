// https://material-ui-1dab0.firebaseapp.com/component-demos/app-bar
import React from 'react';
import { createStyleSheet } from 'jss-theme-reactor';
import customPropTypes from 'material-ui/utils/customPropTypes';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const styleSheet = createStyleSheet('Navbar', () => ({
  root: {
    position: 'relative',
    marginTop: 30,
    width: '100%',
  },
  appBar: {
    position: 'relative',
  },
}));

export default function Navbar(props, context) {
  const classes = context.styleManager.render(styleSheet);
  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography type="title" colorInherit>Sonar</Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

Navbar.contextTypes = {
  styleManager: customPropTypes.muiRequired,
};