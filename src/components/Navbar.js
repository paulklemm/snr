// https://material-ui-1dab0.firebaseapp.com/component-demos/app-bar
import React from 'react';
import { createStyleSheet } from 'jss-theme-reactor';
import customPropTypes from 'material-ui/utils/customPropTypes';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

const styleSheet = createStyleSheet('Navbar', () => ({
  root: {
    marginTop: 0,
    marginBottom: 20,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
}));

export default function Navbar(props, context) {
  const classes = context.styleManager.render(styleSheet);
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" className={classes.flex} color="inherit">Sonar</Typography>
          <Button color="contrast" onClick={props.toggleRightDrawer}>Show datasets</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

Navbar.contextTypes = {
  styleManager: customPropTypes.muiRequired,
};