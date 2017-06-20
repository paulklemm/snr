import React, { Component } from 'react';
import PropTypes from 'prop-types';
// Material-UI Elements
import { withStyles, createStyleSheet } from 'material-ui/styles';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import { Icon } from 'react-fa';
import IconButton from 'material-ui/IconButton';

const styleSheet = createStyleSheet('IconSelect', theme => ({
	root: { },
	iconSelect: {
		fontSize: '90%'
	}
}));

// Choosing Fontawesome-Icons that may fit our approach
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

/** Adapted from [https://material-ui-1dab0.firebaseapp.com/component-demos/menus](https://material-ui-1dab0.firebaseapp.com/component-demos/menus) */
class IconSelect extends Component {
	state = {
		anchorEl: undefined,
		open: false,
		selectedIndex: 1,
	};

	handleMenuItemClick = (event, index) => {
		this.setState({ selectedIndex: index, open: false });
	};

	handleRequestClose = () => {
		this.setState({ open: false });
	};

	handleButtonClick = event => {
		this.setState({ open: true, anchorEl: event.currentTarget });
	};

	render() {
		const classes = this.props.classes;
		return (
			<div>
				<IconButton className={classes.iconSelect} aria-owns="simple-menu" aria-haspopup="true" onClick={this.handleButtonClick}>
					{options[this.state.selectedIndex]}
				</IconButton>
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

IconSelect.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(IconSelect);