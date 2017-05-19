import React from 'react';

class Table extends React.Component{

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
				row.push(<th key={`row_${i}${j}`}>{this.props.data[i][dimension]}</th>);
			}
			table.push(<tr>{row}</tr>);
		}
		return table;
	}

	render() {
		if (this.props.data === undefined) return (<div>no data</div>);
		return (
			<table>
				{this.constructTable()}
			</table>
		);
	}
}
export default Table;
