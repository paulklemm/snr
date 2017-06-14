import React from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import { LabelCheckbox } from 'material-ui/Checkbox';
import { FormGroup } from 'material-ui/Form';

// https://material-ui-1dab0.firebaseapp.com/component-demos/selection-controls
class DatasetSelect extends React.Component {
	getCheckboxes() {
		let datasetCheckboxes = [];
		for (let i in Object.keys(this.props.datasetEnabled)) {
			let datasetName = Object.keys(this.props.datasetEnabled)[i];
			datasetCheckboxes.push(
				<LabelCheckbox
					onChange={(event, checked) => this.props.setEnableDataset(datasetName, checked) }
					label={datasetName}
					key={datasetName}
					checked={this.props.datasetEnabled[datasetName]}
					disabled={this.props.datasetLoading[datasetName]}
				/>
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
				{checkboxes}
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