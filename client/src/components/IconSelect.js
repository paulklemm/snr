import React, { Component } from 'react';
import PropTypes from 'prop-types';
// SONAR Imports
import DatasetIcons from './DatasetIcons';
// Material-UI Elements
import { withStyles } from 'material-ui/styles';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';

const styleSheet = {
  root: { },
  iconSelect: {
    fontSize: '90%'
  }
};

/** Adapted from [https://material-ui-1dab0.firebaseapp.com/component-demos/menus](https://material-ui-1dab0.firebaseapp.com/component-demos/menus) */
class IconSelect extends Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    // Convert DatasetIcons Object to array
    this.iconsArray = Object.values(DatasetIcons);
    // Contains the index of the icon names
    this.iconNameToArrayIndex = {};
    // Array index to icon name, used in handleManuItemClick to get the name of the icon from the array index
    this.arrayIndexToIconName = [];
    for (let i = 0; i < this.iconsArray.length; i++) {
      this.iconNameToArrayIndex[Object.keys(DatasetIcons)[i]] = i;
      this.arrayIndexToIconName.push(Object.keys(DatasetIcons)[i]);
    }
    // Get the icon associated with the data set. If there is none set, get the default one
    let iconName = this.props.getDatasetIcon(props.datasetName);
    // If there is no icon set for the current dataset, add one
    if (iconName === '') {
      this.props.setDatasetIcon(this.props.datasetName, this.arrayIndexToIconName[this.props.defaultIconID]);
      iconName = this.props.getDatasetIcon(props.datasetName);
    }
    const iconID = this.iconNameToArrayIndex[iconName];
    this.state = {
      anchorEl: undefined,
      open: false,
      selectedIndex: iconID
    };
  }

  handleMenuItemClick (event, index) {
    this.setState({ selectedIndex: index, open: false });
    this.props.setDatasetIcon(this.props.datasetName, this.arrayIndexToIconName[index]);
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
        <IconButton className={classes.iconSelect} aria-owns="simple-menu" aria-haspopup="true" onClick={this.handleButtonClick}>
          {this.iconsArray[this.state.selectedIndex]}
        </IconButton>
        <Menu
          id="lock-menu"
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
        >
          {this.iconsArray.map((option, index) =>
            <MenuItem
              key={`${option}+${index}`}
              selected={index === this.state.selectedIndex}
              onClick={event => this.handleMenuItemClick(event, index)}
            >
              {option}
            </MenuItem>,
          )}
        </Menu>
      </div>
    );
  }
}

IconSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet, {name: 'IconSelect'})(IconSelect);