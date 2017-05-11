import React from 'react';
import './App.css';
// eslint-disable-next-line
import BarChart from './BarChart';
// eslint-disable-next-line
import Scatterplot from './Scatterplot';
// eslint-disable-next-line
import Helper from './Helper';
// eslint-disable-next-line
import Hexplot from './Hexplot';
// eslint-disable-next-line
import Piechart from './Piechart';
// eslint-disable-next-line
import DynamicHexBin from './DynamicHexBin';
// eslint-disable-next-line
import ScatterplotRNASeqData from './ScatterplotRNASeqData';
// eslint-disable-next-line
import RNASeqData from './RNASeqData';
import OpenCPUBridge from './OpenCPUBridge';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Layout from 'material-ui/Layout';
import Paper from 'material-ui/Paper';
import Navbar from './Navbar';

const styleSheet = {
	appBody: {
		marginLeft: 10,
		marginRight: 10
	}
};

class App extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	componentWillMount() {
		// Debug RNASeq connection
		let openCPU = new OpenCPUBridge('http://localhost:8004');
		
		openCPU.runRCommand("stats", "rnorm", { n: 10, mean: 5 }).then(output => { 
			console.log(output);
		});
		openCPU.runRCommand("graphics", "hist", { x: [2,3,2,3,4,3,3], breaks: 10}).then(output => {
			this.setState({
				image: `${output.graphics[0]}/svg`
			});
			console.log(output);
		});
		// let rnaSeqData = new RNASeqData('./data/ncd_hfd_small.csv', 'default', 'default data set', ()=>{
		// let rnaSeqData = new RNASeqData('./data/ncd_hfd.csv', 'default', 'default data set', ()=>{
		// let rnaSeqData = new RNASeqData('./data/ncd_hfd_medium.csv', 'default', 'default data set', ()=>{
		let rnaSeqData = new RNASeqData('./data/ncd_hfd_edited.csv', 'default', 'default data set');
		rnaSeqData.readPromise.then(() => {
			// We have to force the update since react will not recognize on it's own that the state object
			// RNASeqData has changed. https://facebook.github.io/react/docs/react-component.html#forceupdate
			this.forceUpdate();
		});
		// Add the rnaSeqData to the state, but it could probably be also a class member
		this.state = {
			rnaSeqData: rnaSeqData
		};
	}

	// TODO Fix stres test
	render() {
		return (
			<MuiThemeProvider>
				<div>
					<Navbar />
					<div style={styleSheet.appBody}>
						<Layout container gutter={16}>
							{ /* <BarChart width={200} height={200} /> */ }
							{ /* <Scatterplot width={200} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" /> */ }
							{ /* <ScatterplotRNASeqData width={200} height={200} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" /> */ }
							{ /* <ScatterplotRNASeqData width={600} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" /> */ }
							{ /* <Hexplot width={600} height={400} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" hexSize={10} hexMax={10} /> */ }
							{ /* <Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/> */ }
							{ /* <Hexplot width={500} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={10} hexMax={10} /> */ }
							<Layout item xs>
								<Paper>
									<img src={`${this.state.image}?width=7&height=5`} width={400} height={200} alt="R test"/>
								</Paper>
							</Layout>
							<Layout item xs>
								<Paper>
									<Scatterplot width={400} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" />
								</Paper>
							</Layout>
							<Layout item xs>
								<Paper>
									<Scatterplot width={400} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" />
								</Paper>
							</Layout>
							<Layout item xs>
								<Paper>
									<Hexplot width={400} height={200} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={6} hexMax={10} />
								</Paper>
							</Layout>
						</Layout>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default App;
