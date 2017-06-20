import React from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import IconSelect from './IconSelect';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup } from 'material-ui/Form';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';

// https://material-ui-1dab0.firebaseapp.com/component-demos/selection-controls
class DatasetSelect extends React.Component {
	getCheckboxes() {
		let datasetCheckboxes = [];
		for (let i in Object.keys(this.props.datasetEnabled)) {
			let datasetName = Object.keys(this.props.datasetEnabled)[i];
			datasetCheckboxes.push(
				<ListItem dense button key={`DatasetSelect_${datasetName}`}>
				<Checkbox
					onChange={(event, checked) => this.props.setEnableDataset(datasetName, checked) }
					checked={this.props.datasetEnabled[datasetName]}
					disabled={this.props.datasetLoading[datasetName]}
				/>
				<ListItemText primary={`Name: ${datasetName}`} />
				<IconSelect />
				</ListItem>
			);
		}
		if (datasetCheckboxes.length === 0)
			datasetCheckboxes.push(<Loading key="CircularProgress_getCheckboxes" />)

		return(datasetCheckboxes);
	}
	render() {
		let checkboxes = this.getCheckboxes();
		return(
			<div>
				<Typography type="display1" gutterBottom>Available Datasets</Typography>
				<List>
				{checkboxes}
				</List>
				<Typography type="display1" gutterBottom>Dataset Info</Typography>
				<Typography type="body1" gutterBottom align="left">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque saepe quis veritatis tenetur corporis quaerat fuga deleniti, hic eius aperiam qui perspiciatis dolore laboriosam obcaecati earum magnam neque illum sed.</Typography>
			</div>
		);
	}
}

DatasetSelect.propTypes = {
	datasetEnabled: PropTypes.object,
	datasetLoading: PropTypes.object,
	setEnableDataset: PropTypes.func
}

export default DatasetSelect;