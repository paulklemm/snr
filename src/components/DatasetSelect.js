import React from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import IconSelect from './IconSelect';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup } from 'material-ui/Form';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';

// https://material-ui-1dab0.firebaseapp.com/component-demos/selection-controls
class DatasetSelect extends React.Component {
	getCheckboxes() {
		let datasetCheckboxes = [];
		for (let i in Object.keys(this.props.datasetEnabled)) {
			let datasetName = Object.keys(this.props.datasetEnabled)[i];
			datasetCheckboxes.push(
				<ListItem dense button >
				<Checkbox
					onChange={(event, checked) => this.props.setEnableDataset(datasetName, checked) }
					key={datasetName}
					checked={this.props.datasetEnabled[datasetName]}
					disabled={this.props.datasetLoading[datasetName]}
				/>
				<IconSelect key={`IconSelect${i}`} />
				<ListItemText primary={`Name: ${datasetName}`} />
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
			<FormGroup row>
				<List>
				{checkboxes}
				</List>
			</FormGroup>
		);
	}
}

DatasetSelect.propTypes = {
	datasetEnabled: PropTypes.object,
	datasetLoading: PropTypes.object,
	setEnableDataset: PropTypes.func
}

export default DatasetSelect;