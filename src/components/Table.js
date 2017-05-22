import React from 'react';

// https://www.youtube.com/watch?v=Bx5JB2FcSnk
// https://jsfiddle.net/vjeux/KbWJ2/9/
class Table extends React.Component{
	constructor() {
		super();
		this.debug = false;
		this.state = {
			rowTop: 0,
			rowBottom: 5
		};
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
				row.push(<th key={`row_${i}${j}`}>{`${i}+${this.props.data[i][dimension]}`}</th>);
			}
			// Push the columns as new row to the table
			table.push(<tr key={`tr_${i}`}>{row}</tr>);
		}
		// The top spacer must not exceed the maximum length of the table minus the visible table window
		const topSpacerHeight = (this.state.rowBottom < this.props.data.length ? this.state.rowTop * 34 : (this.props.data.length - 1 - (this.state.rowBottom - this.state.rowTop)) * 34);
		const topSpacer = [<div key={`topSpacer`} style={{height: topSpacerHeight}}></div>];
		// Bottom spacer is set to 0 when the bottom end is reached
		const bottomSpacerHeight = (this.state.rowBottom < this.props.data.length - 1 ? (this.props.data.length - (this.state.rowBottom + 2)) * 34 : 0);
		const bottomSpacer = (bottomSpacerHeight === 0 ? [] : [<div key={`bottomSpacer`} style={{height: bottomSpacerHeight}}></div>])
		
		if (this.debug) {
			console.log("------------------------");
			console.log(`Data length: ${this.props.data.length}, Topmost element:${this.state.rowTop}, Bottom element: ${this.state.rowBottom}, Bottom spacer height: ${bottomSpacerHeight}, Top spacer height: ${topSpacerHeight}`);
		}

		return(
			<div ref="parentDiff">
			{topSpacer}
			<table>
				<tbody>
					{table}
				</tbody>
			</table>
			{bottomSpacer}
			</div>
		);
	}

	constructTable() {
		// Getting the dimensions like this is still a little hacky
		let dimensions = Object.keys(this.props.data[1]);

		let table = [];
		// Add header table
		let header = [];
		for (let i in dimensions) {
			const dimension = dimensions[i];
			header.push(<th>{dimension}</th>);
		}
		// Push header to the table
		table.push(<tr>{header}</tr>);
		// Push rows
		// for (let i in this.props.data) {
		for (let i = 0; i < 5000; i++) {
			let row = [];
			for (let j in dimensions) {
				const dimension = dimensions[j];
				row.push(<th key={`row_${i}${j}`}>{`${i}+${this.props.data[i][dimension]}`}</th>);
			}
			table.push(<tr>{row}</tr>);
		}
		return table;
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
		return (
			<div 
				ref="scrollable" 
				style={{height:200, top: 26, 'overflowX': 'hidden', 'overflowY': 'auto'}} 
				onScroll={(event) => {
					const rowTop = Math.floor(this.refs.scrollable.scrollTop / 34);
					const rowBottom = Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / 34);
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
		);
	}
}
export default Table;
