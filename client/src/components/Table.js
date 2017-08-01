import React from 'react';
import {Icon} from 'react-fa';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';
import {DefaultFilterSetting} from './DimensionTypes.js';

const styleSheet = {
	headerTR: {
		borderBottom: '2px solid #ee6351',
		backgroundColor: '#fdecea'
	},
	headerTH: {
		textAlign: 'left',
		height: 63,
		overflow: 'hidden'
	},
	th: {
		textAlign: 'left',
		height: 10,
		fontWeight: 'normal',
		overflow: 'hidden'
	},
	table: {
		borderCollapse: 'collapse',
		fontSize: '10px',
		width: '100%',
		tableLayout:'fixed'
	}
}

// https://www.youtube.com/watch?v=Bx5JB2FcSnk
// https://jsfiddle.net/vjeux/KbWJ2/9/
class Table extends React.Component{
	constructor() {
		super();
		this.debug = false;
		// Somehow the height of the TH elements differ from the max-height. Therfore we have to update this as soon as the list is rendered the first time
		this.rowHeight = styleSheet.th.height;
		// We store the textFieldValues of the filter as class attribute since we need it when the operator changes
		this.textFieldValues = {};
		this.state = {
			rowTop: 0,
			rowBottom: 40
		};
	}

	componentWillReceiveProps(nextProps) {
		// If we receive dimNames initialize them
		if (typeof nextProps.dimNames !== "undefined") {
			this.setState({
				filterSetting: this.getDefaultFilterSettings(nextProps.dimNames)
			});
		}
	}

	/** Since the FPKM value names differ, they need to be derived from the dimension names
	 * @param {Array} dimNames Array of dimension names
	*/
	getDefaultFilterSettings(dimNames) {
		let filterSetting = DefaultFilterSetting;
		// Iterate through the values and look for FPKM values
		for (let i in dimNames) {
			const dim = dimNames[i];
			// Check if the dim name contains FPKM and if so, add the FPKM settings
			if (/FPKM/i.test(dim)) {
				filterSetting[dim] = filterSetting.FPKM;
			}
		}
		return(filterSetting);
	}

	handleFilter(dimension) {
		// Scroll back to the top of the list
		this.refs.scrollable.scrollTop = 0;
		// Remove all filters of this dimension
		this.props.filter.removeFilter(dimension);
		this.props.filter.setFilter(dimension, this.textFieldValues[dimension], this.state.filterSetting[dimension])
		// Update the app
		this.props.forceUpdateApp();
	}

	/**
	 * Sets the new x dimension for the hexplots in the main app
	 * @param {String} dimension: New dimension for hexplots in main app
	 */
	onHeaderClick(dimension) {
		this.props.changePlotDimension(dimension);
	}

	constructTableHeader() {
		// let dimensions = Object.keys(DimensionTypes);
		let dimensions = this.props.dimNames;
		// Add header table
		let header = [];
		for (let i in dimensions) {
			const dimension = dimensions[i];
			// Check if there are filter available for the current dimension and set filter value accordingly
			const filter = this.props.filter.getFilterOfDimension(dimension);
			// Default filter value is an empty string
			let filterValue = '';
			// We only need to update the filter value when there is exactly one filter set for the current dimension
			// Otherwise we will simply set the filterValue to `''`
			if (filter.length === 1) {
				// Update filterValue to proper value
				filterValue = filter[0].value;
				// Update Operator if necessary
				let filterSetting = this.state.filterSetting;
				if (filterSetting[dimension] !== filter[0].operator) {
					filterSetting[dimension] = filter[0].operator;
					this.setState({ filterSetting: filterSetting });
				}
			}

			header.push(
				<th key={`header-th-${i}`}>
					<div style={styleSheet.headerTH}>
						<div onClick={ () => { this.onHeaderClick(dimension)} }>
						{/* <Typography noWrap type="body1"><Icon name="sort-desc" style={{fontSize:'100%'}} /> {dimension}</Typography> */}
						{dimension}
						</div>
						<div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
						<IconButton
							style={{ marginTop: '-2px', width: '10px' }}
							onClick={(event) => {
								// Update filter
								const currentOperator = event.target.textContent;
								let filterSetting = this.state.filterSetting;
								// Switch signs
								if (currentOperator === '<') {
									filterSetting[dimension] = '>';
									this.setState({ filterSetting: filterSetting });
									this.handleFilter(dimension);
								} else if (currentOperator === '>') {
									filterSetting[dimension] = '<';
									this.setState({ filterSetting: filterSetting });
									this.handleFilter(dimension);
								}
							}}
						>
							{
								this.state.filterSetting[dimension]
							}
						</IconButton>
							<TextField 
							style={{ width: '100% important!', marginLeft: '5px'}}
								id="filter" 
								label="Filter"
								value={filterValue}
								onChange={(event) => {
									// Update the textfieldValue object with the newly changed value
									this.textFieldValues[dimension] = event.target.value;
									this.handleFilter(dimension);
								}}
							/>
						</div>
					</div>
				</th>
			);
		}
		return(
			<table style={styleSheet.table}>
				<tbody>
					<tr key="header-tr" style={styleSheet.headerTR}>{header}</tr>
				</tbody>
			</table>
		);
	}

	constructTableDynamic() {
		// let dimensions = Object.keys(DimensionTypes);
		let dimensions = this.props.dimNames;
		let table = [];
		// Iterate over the top and bottom element
		for (let i = this.state.rowTop; i <= this.state.rowBottom; i++) {
			// Avoid rendering empty rows (can happen in small lists or filters yielding empty lists)
			if (i > this.props.data.length - 1)
				break;
			// Initialize an empty row element
			let row = [];
			// Iterate through all dimensions (columns) in the data
			let dimensionKey = "";
			for (let j in dimensions) {
				const dimension = dimensions[j];
				dimensionKey += this.props.data[i][dimension];
				// row.push(<th key={`row_${i}${j}`}><div style={styleSheet.th}>{this.props.data[i][dimension]}</div></th>);
				row.push(
					<th key={`row_${this.props.data[i][dimension]}-${i}-${j}`}>
						<div style={styleSheet.th}>
							{/* <Typography type="body1"> */}
								{this.props.data[i][dimension]}
							{/* </Typography> */}
						</div>
					</th>
				);
			}
			// Push the columns as new row to the table
			const evenClass = (i % 2 === 0) ? 'odd' : '';
			table.push(<tr key={`tr_${dimensionKey}_${i}`} className={evenClass}>{row}</tr>);
		}
		// The top spacer must not exceed the maximum length of the table minus the visible table window
		let topSpacerHeight = (this.state.rowBottom < this.props.data.length ? this.state.rowTop * this.rowHeight : (this.props.data.length - 1 - (this.state.rowBottom - this.state.rowTop)) * this.rowHeight);
		// When the elements do not fill the entire height the spacer height would get negative. Fix this by setting it to 0
		if (topSpacerHeight < 0) topSpacerHeight = 0;
		const topSpacer = [<div key={`topSpacer`} style={{height: topSpacerHeight}}></div>];
		// Bottom spacer is set to 0 when the bottom end is reached
		const bottomSpacerHeight = (this.state.rowBottom < this.props.data.length - 1 ? (this.props.data.length - (this.state.rowBottom + 2)) * this.rowHeight : 0);
		const bottomSpacer = (bottomSpacerHeight === 0 ? [] : [<div key={`bottomSpacer`} style={{height: bottomSpacerHeight}}></div>])
		
		if (this.debug) {
			console.log("------------------------");
			console.log(`Data length: ${this.props.data.length}, Topmost element:${this.state.rowTop}, Bottom element: ${this.state.rowBottom}, Bottom spacer height: ${bottomSpacerHeight}, Top spacer height: ${topSpacerHeight}`);
		}

		return(
			<div>
				{topSpacer}
				<table style={styleSheet.table}>
					<tbody ref={(body) => { this.tableBody = body; }}>
						{/* {this.constructTableHeader(dimensions)} */}
						{table}
					</tbody>
				</table>
				{bottomSpacer}
			</div>
		);
	}

	renderRequired(newRowTop, newRowBottom) {
		// Prevent overflowing list
		// if (this.state.rowBottom >= this.props.data.length - 1 && newRowBottom >= this.props.data.length - 1)
		// 	return false;
		// Only return true when the visible cells differ
		if (newRowTop === this.state.rowTop && newRowBottom === this.state.rowBottom)
			return false;
		else
			return true;
	}

	setScrollState() {
		const rowTop = Math.floor(this.refs.scrollable.scrollTop / this.rowHeight);
		const rowBottom = Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / this.rowHeight);
		// Only change state if re-rendering is required
		if (this.renderRequired(rowTop, rowBottom)) {
			this.setState({
				rowTop: rowTop,
				rowBottom: rowBottom
			});
		}
	}

	render() {
		if (this.props.data === undefined) return (<div>no data</div>);
		// console.log(this.props.data);
		// console.log(this.props.dimNames);
		// Update the default height of the row to have precise calculations on the table and not rely on the style sheet
		if (this.tableBody !== undefined && this.tableBody.children[0] !== undefined) this.rowHeight = this.tableBody.children[0].clientHeight;
		if (this.debug) console.log(`Set rowHeight to ${this.rowHeight}`);
		return (
			<div>
			 <div><p>{`Rendering ${this.props.data.length} rows`}</p></div> 
			{this.constructTableHeader()}
			<div 
				ref="scrollable" 
				style={{height:this.props.height, 'overflowX': 'hidden', 'overflowY': 'auto'}} 
				onScroll={() => {
					this.setScrollState();
				}}>
				{this.constructTableDynamic()}
			</div>
			</div>
		);
	}
}

Table.propTypes = { 
	data: PropTypes.array, 
	dimNames: PropTypes.array, 
	height: PropTypes.number, 
	filter: PropTypes.object,
	changePlotDimension: PropTypes.func 
} 
export default Table;
