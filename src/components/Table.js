import React from 'react';
import {Icon} from 'react-fa';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';

const styleSheet = {
	headerTH: {
		textAlign: 'left',
		height: 60,
		overflow: 'hidden'
	},
	th: {
		textAlign: 'left',
		height: 25,
		overflow: 'hidden'
	},
	table: {
		borderCollapse: 'collapse',
		width: '100%',
		tableLayout:'fixed'
	}
}

// https://www.youtube.com/watch?v=Bx5JB2FcSnk
// https://jsfiddle.net/vjeux/KbWJ2/9/
class Table extends React.Component{
	constructor() {
		super();
		this.debug = true;
		// Somehow the height of the TH elements differ from the max-height. Therfore we have to update this as soon as the list is rendered the first time
		this.rowHeight = styleSheet.th.height;
		this.headerHeight = styleSheet.headerTH.height + 2;
		this.state = {
			rowTop: 0,
			rowBottom: 20
		};
	}

	constructTableHeader() {
		let dimensions = Object.keys(this.props.data[1]);
		// Add header table
		let header = [];
		for (let i in dimensions) {
			const dimension = dimensions[i];
			header.push(
				<th key={`header-th-${i}`}>
					<div style={styleSheet.headerTH}>
						<Typography type="body2">{dimension}</Typography>
						<TextField id="filter" label="Filter"/>
					</div>
				</th>
			);
		}
		return(
			<table style={styleSheet.table}>
				<tbody>
					<tr key="header-tr">{header}</tr>
				</tbody>
			</table>
		);
	}

	constructTableDynamic() {
		// Getting the dimensions like this is still a little hacky
		let dimensions = Object.keys(this.props.data[1]);
		let table = [];
		// Iterate over the top and bottom element
		for (let i = this.state.rowTop; i <= this.state.rowBottom; i++) {
			// Initialize an empty row element
			let row = [];
			// Iterate through all dimensions (columns) in the data
			for (let j in dimensions) {
				const dimension = dimensions[j];
				// row.push(<th key={`row_${i}${j}`}><div style={styleSheet.th}>{this.props.data[i][dimension]}</div></th>);
				row.push(
					<th key={`row_${i}${j}`}>
						<div style={styleSheet.th}>
							<Typography type="body1">
								{this.props.data[i][dimension]}
							</Typography>
						</div>
					</th>
				);
			}
			// Push the columns as new row to the table
			// table.push(<tr style={styleSheet.th} key={`tr_${i}`}>{row}</tr>);
			table.push(<tr key={`tr_${i}`}>{row}</tr>);
		}
		// The top spacer must not exceed the maximum length of the table minus the visible table window
		const topSpacerHeight = (this.state.rowBottom < this.props.data.length ? this.state.rowTop * this.rowHeight : (this.props.data.length - 1 - (this.state.rowBottom - this.state.rowTop)) * this.rowHeight);
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
		if (this.state.rowBottom >= this.props.data.length - 1 && newRowBottom >= this.props.data.length - 1)
			return false;
		// Only return true when the visible cells differ
		if (newRowTop === this.state.rowTop && newRowBottom === this.state.rowBottom)
			return false;
		else
			return true;
	}

	render() {
		if (this.props.data === undefined) return (<div>no data</div>);
		// Update the default height of the row to have precise calculations on the table and not rely on the style sheet
		if (this.tableBody !== undefined) this.rowHeight = this.tableBody.children[2].clientHeight;
		if (this.debug) console.log(`Set rowHeight to ${this.rowHeight}`);
		return (
			<div>{this.constructTableHeader()}
			<div 
				ref="scrollable" 
				style={{height:this.props.height, 'overflowX': 'hidden', 'overflowY': 'auto'}} 
				onScroll={() => {
					const rowTop = Math.floor(this.refs.scrollable.scrollTop / this.rowHeight);
					const rowBottom = Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / this.rowHeight);
					// const rowBottom = Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight - this.headerHeight) / this.rowHeight);
					// Only change state if re-rendering is required
					if (this.renderRequired(rowTop, rowBottom)) {
						this.setState({
							rowTop: rowTop,
							rowBottom: rowBottom
						});
					}
				}}>
				{this.constructTableDynamic()}
			</div>
			</div>
		);
	}
}
export default Table;
