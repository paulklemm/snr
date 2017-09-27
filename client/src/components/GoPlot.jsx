import React from 'react';
// Import D3 stuff
import { scaleLinear } from 'd3-scale';
import { max, min, mean } from 'd3-array';
import { interpolateLab } from 'd3-interpolate';
import { objectValueToArray } from './Helper';

class GoPlot extends React.Component {

	constructor() {
		super();
		// Bind `this` to the individual functions
		this.onMouseLeaveRect = this.onMouseLeaveRect.bind(this);
		this.onMouseMoveRect = this.onMouseMoveRect.bind(this);
		this.state = {
			tooltip: ''
		};
	}

	componentWillMount() {
		this.update();
	}

	componentWillUpdate() {
		this.update();
	}

	render() {
		return (
			<div>
				{this.props.goTerm.goId}
				<svg
					width={this.props.width}
					height={this.props.height}
				>
					{this.renderBars()}
				</svg>
				{this.state.tooltip}
			</div>
		);
	}

	/**
	 * React to mouse movement on rect elements
	 * 
	 * @param {Event} event Mouse move event
	 */
	onMouseMoveRect(event, id, val) {
		let dx = event.pageX - 75;
		let dy = event.pageY - 35;
		let tooltip =
			<div className="tooltip"
				style={{
					position: 'absolute',
					left: dx,
					top: dy
				}}
			>
				{`${id}, ${val}`}
			</div>

		this.setState({
			tooltip: tooltip
		});
	}

	/**
	 * React on mouse leave event on rect elements
	 */
	onMouseLeaveRect() {
		this.setState({
			tooltip: ""
		});
	}

	/**
	 * Takes EnsemblIDs array and converts it to array of dimension values
	 * based on the given dataset
	 * 
	 * @param {Dataset} dataset 
	 * @param {String} dimension 
	 * @param {Array} ids 
	 */
	convertData(dataset, dimension, ids) {
		// Initialitze empty data array
		let data = [];
		// Iterate over all ids and get the values of `dimension` out of it
		for (const id of ids)
			// Get the index of the entry
			data.push({
				'val': parseInt(dataset.getEntry(id, dimension), 10),
				'id': id
			});

		// Update the state
		// TODO: Move to State!
		this.data = data;
	}

	/**
	 * React on changes of properties or state by updating the class members
	 */
	update() {
		// Get the data
		if (this.props.drawWholeGO)
			// Derive the data from all genes in the GO-term
			this.convertData(this.props.dataset, this.props.dimension, this.props.goTermSummary['genes'])
		else
			// Derive data from all selected genes in GO-term
			this.convertData(this.props.dataset, this.props.dimension, this.props.goTerm['ids'])
		// Sort the data
		this.dataSorted = this.data.sort((a, b) => a['val'] - b['val']);
		// Get DataSorted value array for min/mean/max
		const datasortedValues = objectValueToArray(this.dataSorted, 'val');
		// Update scales
		this.colorScale = scaleLinear()
			.domain([min(datasortedValues), mean(datasortedValues), max(datasortedValues)])
			.range(["blue", "rgba(0, 0, 0, 0)", "#ee6351"])
			.interpolate(interpolateLab);
		// Width scale
		this.widthScale = scaleLinear()
			.range([0, this.props.maxWidth])
			.domain([0, this.props.maxGeneCount]);
	}

	/**
	 * Render bars as rect elements deriving color from data
	 * @return {Array} List of svg rect elements
	 */
	renderBars() {
		// Init empty array of rects
		let rects = [];
		// Get the data
		let data = this.dataSorted;
		// Width of the bar is the maximum width divided by the number of data elements
		const barWidth = this.widthScale(data.length) / data.length;
		// Iterate over each entry to add a bar
		data.forEach((val, index) => {
			rects.push(
				<rect
					width={barWidth}
					height={this.props.height}
					fill={this.colorScale(val['val'])}
					x={barWidth * index}
					y={0}
					key={`Value ${val} + Index ${index}`}
					onMouseMove={(e) => this.onMouseMoveRect(e, val['id'], val['val'])}
					onMouseLeave={this.onMouseLeaveRect}
				/>
			);
		});
		return rects;
	}
}

export default GoPlot;