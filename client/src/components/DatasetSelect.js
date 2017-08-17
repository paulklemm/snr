import React from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';
import IconSelect from './IconSelect';
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import { Icon } from 'react-fa';

const styleSheet = {
	primaryDatasetIcon: {
		fontSize: '130%',
		color: 'red'
	},
	standardDatasetIcon: {
		fontSize: '90%',
		color: 'gray'
	}
};

class DatasetSelect extends React.Component {
	constructor() {
		super();
		this.state = {
			metadata: {},
			metadataDatasetName: ''
		};
	}

	/**
	 * Fetch the metadata from server and renders it in the client
	 * 
	 * @param {String} datasetName Name of clicked data set
	 */
	async handleListItemClick(datasetName) {
		// Get metadata from back-end
		let metadata = await this.props.getMetadata(datasetName);
		if (metadata.success) {
			this.setState({
				metadata: metadata.metadata,
				metadataDatasetName: datasetName
			});
		}
	}

	getCheckboxes() {
		let datasetCheckboxes = [];
		for (let i in Object.keys(this.props.datasetEnabled)) {
			let datasetName = Object.keys(this.props.datasetEnabled)[i];
			datasetCheckboxes.push(
				<ListItem dense button key={`DatasetSelect_${datasetName}`} onClick={() => this.handleListItemClick(datasetName)}>
					<Checkbox
						onChange={(event, checked) => this.props.setEnableDataset(datasetName, checked) }
						checked={this.props.datasetEnabled[datasetName]}
						disabled={this.props.datasetLoading[datasetName]}
					/>
					<ListItemText primary={`Name: ${datasetName}`} />
					{/* Icon to see whether the data set is primary on or not */}
					{/* TODO: Get the status from the current session */}
					<IconButton aria-owns="simple-menu" style={styleSheet.primaryDatasetIcon} onClick={this.handleButtonClick}>
							<Icon name="check-circle-o" />
					</IconButton>

					<IconSelect defaultIconID={ i } datasetName={datasetName} setDatasetIcon={this.props.setDatasetIcon} getDatasetIcon={this.props.getDatasetIcon} />
				</ListItem>
			);
		}
		if (datasetCheckboxes.length === 0)
			datasetCheckboxes.push(<Loading key="CircularProgress_getCheckboxes" />)

		return(datasetCheckboxes);
	}

	getMetadataList() {
		const metadataKeys = Object.keys(this.state.metadata);
		let metadataListEntries = [];
		for (let i in metadataKeys) {
			// Check what kind of element we have
			const value = this.state.metadata[metadataKeys[i]];
			// Check if value is an array or length is grater than 1
			const valueToPrint = (Object.prototype.toString.call(value) === "[object Array]" && value.length === 1) ? value[0] : value;
			metadataListEntries.push(
				<ListItem button key={`Metadata_${metadataKeys[i]}`}> 
					<ListItemText 
						primary={`${metadataKeys[i]}: ${JSON.stringify(valueToPrint)}` }
					/>
				</ListItem>
			);
		}
		return metadataListEntries;
	}

	render() {
		const checkboxes = this.getCheckboxes();
		const metadata = this.getMetadataList();
		return(
			<div>
				<Typography type="headline" gutterBottom>Available Datasets</Typography>
				<List>
					{checkboxes}
				</List>
				<Typography type="headline" gutterBottom>{`Dataset Info ${this.state.metadataDatasetName}`}</Typography>
				<List>
					{metadata}
				</List>
				{/* <Typography type="body1" gutterBottom align="left">{JSON.stringify(this.state.metadata, null, 2)}</Typography> */}
			</div>
		);
	}
}

DatasetSelect.propTypes = {
	datasetEnabled: PropTypes.object,
	datasetLoading: PropTypes.object,
	setEnableDataset: PropTypes.func,
	getMetadata: PropTypes.func,
	setDatasetIcon: PropTypes.func,
	getDatasetIcon: PropTypes.func
}

export default DatasetSelect;