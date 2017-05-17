import React from 'react';
import { LabelCheckbox } from 'material-ui/Checkbox';
import { FormGroup } from 'material-ui/Form';
import { CircularProgress } from 'material-ui/Progress';

const styleSheet = {
	progress: {
		['margin-left']:'auto',
		['margin-right']:'auto',
		['margin-top']: '10',
		['margin-bottom']: '10',
		width: '40px',
		height: '40px'
	}
};
// https://material-ui-1dab0.firebaseapp.com/component-demos/selection-controls
class DatasetSelect extends React.Component {
	componentWillReceiveProps(nextProps) {
		let selectStatus = {};
		for (let i in nextProps.datasets) {
			selectStatus[nextProps.datasets[i]] = true;
		}
		this.setState({
			selectStatus: selectStatus
		});
	}

	getCheckboxes() {
		let datasetCheckboxes = [];
		for (let i in this.props.datasets) {
			let datasetName = this.props.datasets[i];
			datasetCheckboxes.push(
				<LabelCheckbox
					onChange={(event, checked) => { 
						let selectStatus = {...this.state.selectStatus};
						selectStatus[datasetName] = checked;
						this.setState({ selectStatus: selectStatus });
					}}
					label={datasetName}
					key={datasetName}
					checked={this.state.selectStatus[datasetName]}
				/>
			);
		}
		if (datasetCheckboxes.length == 0)
			datasetCheckboxes.push(<CircularProgress style={styleSheet.progress} />)
		
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