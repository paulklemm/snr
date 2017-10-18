import React, { Component } from 'react';
import PropTypes from 'prop-types';
// SONAR Imports
import DatasetIcons from './DatasetIcons';
// Material-UI Elements
import { withStyles } from 'material-ui/styles';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';

const styleSheet = {
  root: {},
  iconSelect: {
    fontSize: '90%'
  }
};

/** Adapted from [https://material-ui-1dab0.firebaseapp.com/component-demos/menus](https://material-ui-1dab0.firebaseapp.com/component-demos/menus) */
class IconSelect extends Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    // Get the icon associated with the data set
    const iconName = props.getDatasetIcon(props.datasetName);
    this.state = {
      anchorEl: undefined,
      open: false,
      selectedIndex: iconName
    };
  }

  handleMenuItemClick(event, iconName) {
    this.setState({ selectedIndex: iconName, open: false });
    this.props.setDatasetIcon(this.props.datasetName, iconName);
  }

  handleRequestClose() {
    this.setState({ open: false });
  }

  handleButtonClick(event) {
    this.setState({ open: true, anchorEl: event.currentTarget });
  }

  render() {
    const classes = this.props.classes;
    return (
      <div>
        <IconButton
          className={classes.iconSelect}
          aria-owns="simple-menu"
          aria-haspopup="true"
          onClick={this.handleButtonClick}
        >
          {DatasetIcons[this.state.selectedIndex]}
        </IconButton>
        <Menu
          id="lock-menu"
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
        >
          {Object.values(DatasetIcons).map((icon, index) => (
            <MenuItem
              key={`${Object.keys(DatasetIcons)[index]}+${index}`}
              selected={
                Object.keys(DatasetIcons)[index] === this.state.selectedIndex
              }
              onClick={event =>
                this.handleMenuItemClick(
                  event,
                  Object.keys(DatasetIcons)[index]
                )}
            >
              {icon}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

IconSelect.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styleSheet, { name: 'IconSelect' })(IconSelect);
