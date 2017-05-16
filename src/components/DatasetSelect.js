import React from 'react';
import { LabelCheckbox } from 'material-ui/Checkbox';
import { FormGroup } from 'material-ui/Form';

// https://material-ui-1dab0.firebaseapp.com/component-demos/selection-controls
class DatasetSelect extends React.Component {
	getCheckboxes() {
		let datasetCheckboxes = [];
		console.log(`getCheckboxes`);
		console.log(this.props.datasets);
		for (let i in this.props.datasets) {
			datasetCheckboxes.push(
				<LabelCheckbox
					// onChange={(event, checked) => this.setState({ checkedA: checked })}
					label={this.props.datasets[i]}
					key={this.props.datasets[i]}
					// value= "checkedA"
				/>
			);
		}
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

export default DatasetSelect;