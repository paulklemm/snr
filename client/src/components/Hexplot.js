import React from 'react';
import PropTypes from 'prop-types';
import Scatterplot from './Scatterplot';
import Helper from './Helper';
import SelectionRectangle from './SelectionRectangle';
import {hexbin as D3Hexbin} from 'd3-hexbin';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import Measure from 'react-measure';

// Important Links
// https://github.com/d3/d3-hexbin
// https://github.com/joelburget/d4/blob/master/demo/dynamic-hexbin.js
// https://bl.ocks.org/mbostock/4248145
// https://github.com/d3/d3-hexbin#_hexbin
// TODO: Add Colormap Legend
class Hexplot extends Scatterplot {
	constructor() {
		super();
		this.state = {
			renderDots: false,
			selectionRectangle: new SelectionRectangle()
		}
		this.onMeasure = this.onMeasure.bind(this);
	}

	createPointArray(x, y) {
		let pointArray = [];
		x.map((entry, i) => {
			let point = [this.xScale(x[i]), this.yScale(y[i])];
			pointArray.push(point);
			// We do not need to return anything here, but 'map' expects a return
			return point;
		});
		return pointArray;
	}

	static printHexagons(pointArray, hexRadius, maximum) {
		let hexbin = D3Hexbin().radius(hexRadius);
		let color = scaleLinear()
			.domain([0, maximum])
			.range(["rgba(0, 0, 0, 0)", "#ee6351"])
			.interpolate(interpolateLab);

		const hexagons = hexbin(pointArray).map(point => (
			<path
				d={hexbin.hexagon(hexRadius - 0.5)}
				transform={`translate(${point.x}, ${point.y})`}
				fill={color(point.length)}
				key={`${point.x},${point.y}`}
			/>
		));
		return hexagons;
	}

	render() {
		// Check if there is data available
		if (this.props.rnaSeqData.data === undefined ||typeof this.props.filter === 'undefined') return (<div>no data</div>);
		// reset margin and scale in case they changed
		this.setMargin();
		// Get the whole data set even if it was filtered
		let data = this.props.rnaSeqData.getData(true);
		// Get the filter for the data set, which is a boolean array
		let filter = this.props.rnaSeqData.filtered;
		// setScale requires an array of numeric values for each dimension
		// therefore we have to convert it
		let xArray = Helper.objectValueToArray(data, this.props.xName)
		let yArray = Helper.objectValueToArray(data, this.props.yName)
		this.setScale(xArray, yArray);

		let axes = this.renderAxes();
		let dots = [];
		if (this.state.renderDots) {
			if (this.state.selectionRectangle.boundsSet)
				dots = this.renderDots(1, xArray, yArray, filter, this.state.selectionRectangle.bounds);
			else
				dots = this.renderDots(1, xArray, yArray, filter);
		}
		let axisLabels = this.renderAxisLabels(this.props.xName, this.props.yName);
		let pointArray = this.createPointArray(xArray, yArray);

		let hexagons = Hexplot.printHexagons(pointArray, this.props.hexSize, this.props.hexMax);
		// UI Element for enabling FormControlLabel
		let renderGenesOption = <FormControlLabel
			control={<Switch 
				checked={this.state.renderDots}
				onChange={(event, checked) => this.setState({ renderDots: checked })}
			/>}
			label="Render Genes"
			/>;

		// Set Selection rectangle according to the filters
		this.state.selectionRectangle.setRectangleByFilter(this.props.xName, this.props.yName, this.xScale, this.yScale, this.props.filter);

		return(
			<Measure
				bounds
				onMeasure={this.onMeasure}
			>
				{({ measureRef }) =>
				<div ref={measureRef}>
					{this.props.showRenderGenesOption ? renderGenesOption : ''}
					<svg 
							className="hexagons"
							onMouseDown={(e) => this.handleMouseDown(e)}
							onMouseMove={(e) => this.handleMouseMove(e)}
							onMouseUp={(e) => this.handleMouseUp(e)}
							width={this.widthNoMargin + this.margin.left + this.margin.right} 
							height={this.heightNoMargin + this.margin.top + this.margin.bottom}>
						<g transform={`translate(${this.margin.left},${this.margin.top})`}>
							{hexagons}
							{dots}
							{axes}
							{axisLabels}
							{this.state.tooltip}
							{this.state.selectionRectangle.getRectangle()}
							/>
						</g>
					</svg>
				</div>
				}
			</Measure>
		);
	}
}

Hexplot.propTypes = {
	responsiveWidth: PropTypes.bool,
	responsiveHeight: PropTypes.bool,
	xLabel: PropTypes.string,
	yLabel: PropTypes.string,
	rnaSeqData: PropTypes.object.isRequired,
	hexSize: PropTypes.number.isRequired,
	hexMax: PropTypes.number.isRequired,
	showRenderGenesOption: PropTypes.bool.isRequired
}

export default Hexplot;