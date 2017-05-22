import React from 'react';

// https://www.youtube.com/watch?v=Bx5JB2FcSnk
// https://jsfiddle.net/vjeux/KbWJ2/9/
class Table extends React.Component{
	constructor() {
		super();
		this.state = {
			row_top: 0,
			row_bottom: 5
		};
	}

	constructTableDynamic() {
		// Getting the dimensions like this is still a little hacky
		let dimensions = Object.keys(this.props.data[1]);
		let table = [];
		console.log("------------------------");
		for (let i = this.state.row_top; i <= this.state.row_bottom; i++) {
			let row = [];
			for (let j in dimensions) {
				const dimension = dimensions[j];
				row.push(<th key={`row_${i}${j}`}>{`${i}+${this.props.data[i][dimension]}`}</th>);
			}
			table.push(<tr key={`tr_${i}`}>{row}</tr>);
		}
		// if (this.refs.parentDiff !== undefined) console.log(`Hoehe Parent: ${this.refs.parentDiff.clientHeight}`);
		if (this.refs.parentDiff !== undefined) console.log(`Elemen_oben:${this.state.row_top}, Element_unten: ${this.state.row_bottom}`);
		let aboveSpacer = [<div key={`aboveSpacer`} style={{height: this.state.row_top * 34}}></div>];
		let belowSpacer = [<div key={`belowSpacer`} style={{height: (this.props.data.length - (this.state.row_bottom + 1)) * 34}}></div>];
		console.log(`Hoehe: ${this.props.data.length}, Elemen_oben:${this.state.row_top}, Element_unten: ${this.state.row_bottom}`);
		// console.log(`Box_Oben: ${this.state.row_top * 34}`);
		// console.log(`Box_Unten: ${(this.props.data.length - (this.state.row_bottom + 1)) * 34}`);
		// let belowSpacer = [<div style={{height: 2000 * 34}}></div>];
		
		return(
			<div ref="parentDiff">
			{aboveSpacer}
			<table>
				{table}
			</table>
			{belowSpacer}
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

	renderRequired() {
		if (Math.floor(this.refs.scrollable.scrollTop / 34) === this.state.row_top && 
			  Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / 34) === this.state.row_bottom)
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
					// console.log(event); 
					// console.log(this.refs.scrollable.scrollTop);
					if (this.renderRequired()) {
						this.setState({
							row_top: Math.floor(this.refs.scrollable.scrollTop / 34),
							row_bottom: Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / 34)
						});
					}
					// let row_top = Math.floor(this.refs.scrollable.scrollTop / 34)
					// let row_bottom = Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / 34)
					// console.log(`Element Top: ${row_top}, Element Bottom: ${row_bottom}`);
				}}>
				{/* <table> */}
					{/*this.constructTable()*/}
					{this.constructTableDynamic()}
				{/* </table> */}
			</div>
		);
	}
}
export default Table;
