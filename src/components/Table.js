import React from 'react';

const styleSheet = {
	th: {
		textAlign: 'left',
		height: 30
	}
}

// https://www.youtube.com/watch?v=Bx5JB2FcSnk
// https://jsfiddle.net/vjeux/KbWJ2/9/
class Table extends React.Component{
	constructor() {
		super();
		this.debug = false;
		this.state = {
			rowTop: 0,
			rowBottom: 20
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
				row.push(<th key={`row_${i}${j}`}>{this.props.data[i][dimension]}</th>);
			}
			// Push the columns as new row to the table
			table.push(<tr style={styleSheet.th} key={`tr_${i}`}>{row}</tr>);
		}
		// The top spacer must not exceed the maximum length of the table minus the visible table window
		const topSpacerHeight = (this.state.rowBottom < this.props.data.length ? this.state.rowTop * styleSheet.th.height : (this.props.data.length - 1 - (this.state.rowBottom - this.state.rowTop)) * styleSheet.th.height);
		const topSpacer = [<div key={`topSpacer`} style={{height: topSpacerHeight}}></div>];
		// Bottom spacer is set to 0 when the bottom end is reached
		const bottomSpacerHeight = (this.state.rowBottom < this.props.data.length - 1 ? (this.props.data.length - (this.state.rowBottom + 2)) * styleSheet.th.height : 0);
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
				style={{height:this.props.height, 'overflowX': 'hidden', 'overflowY': 'auto'}} 
				onScroll={() => {
					const rowTop = Math.floor(this.refs.scrollable.scrollTop / styleSheet.th.height);
					const rowBottom = Math.floor((this.refs.scrollable.scrollTop + this.refs.scrollable.clientHeight) / styleSheet.th.height);
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
