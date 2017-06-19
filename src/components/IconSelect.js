import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import { Icon } from 'react-fa';

const styleSheet = createStyleSheet('SimpleListMenu', theme => ({
  root: {
    // width: '100%',
    // maxWidth: '360px',
    maxWidth: '50px',
    // maxHeight: '45px',
    // marginTop: '-10px',
    background: theme.palette.background.paper,
  },
}));

const options = [
  <Icon name="paw" />,
  <Icon name="moon-o" />,
  <Icon name="bell" />,
  <Icon name="coffee" />,
  <Icon name="diamond" />,
  <Icon name="flash" />,
  <Icon name="gift" />,
  <Icon name="life-bouy" />,
  <Icon name="snowflake-o" />,
  <Icon name="snowflake-o" />,
  <Icon name="plane" />,
  <Icon name="heartbeat" />,
  <Icon name="anchor" />,
  <Icon name="asterisk" />,
  <Icon name="birthday-cake" />,
  <Icon name="shield" />,
  <Icon name="tree" />,
  <Icon name="wheelchair" />,
  <Icon name="umbrella" />,
  <Icon name="trophy" />,
  <Icon name="taxi" />,
  <Icon name="music" />,
  <Icon name="leaf" />,
  <Icon name="key" />,
  <Icon name="fire" />,
  <Icon name="child" />,
  <Icon name="blind" />,
  <Icon name="ban" />,
  <Icon name="archive" />,
  <Icon name="bath" />,
  <Icon name="shower" />
];

class SimpleListMenu extends Component {
  state = {
    anchorEl: undefined,
    open: false,
    selectedIndex: 1,
  };

  button = undefined;

  handleClickListItem = event => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (event, index) => {
    this.setState({ selectedIndex: index, open: false });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <List>
          <ListItem
            button
            aria-haspopup="true"
            aria-controls="lock-menu"
            aria-label="When device is locked"
            onClick={this.handleClickListItem}
          >
            <ListItemText
              primary={options[this.state.selectedIndex]}
            />
          </ListItem>
        </List>
        <Menu
          id="lock-menu"
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
        >
          {options.map((option, index) =>
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

SimpleListMenu.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(SimpleListMenu);