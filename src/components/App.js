import React from 'react';
import logo from './logo.svg';
import './App.css';
import BarChart from './BarChart';
import Scatterplot from './Scatterplot';
import Helper from './Helper';
import Hexplot from './Hexplot';
import DynamicHexBin from './DynamicHexBin';

// <Scatterplot width={200} height={200} data={data} settings={{'x': {'variableName': 'sepalWidth', 'label': 'Sepal Width (cm)'}, 'y': {'variableName': 'sepalLength', 'label': 'Sepal Length (cm)'}}}/>
// <Scatterplot width={600} height={600} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 60000, milliseconds: 8000}} />
// <BarChart width={300} height={300} />
// <div className="App-header">
// 					<img src={logo} className="App-logo" alt="logo" />
// 					<h2>Welcome to React</h2>
// 				</div>
// <Scatterplot width={200} height={200} data={Helper.createDummyDataScatterplot(200)} settings={Helper.createDummySettingsScatterplot()}/>
// 				<Scatterplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()}/>
// 				<Scatterplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 100, milliseconds: 500}} />
// <DynamicHexBin />
class App extends React.Component {
	render() {
		return (
			<div className="App">
				<Hexplot width={600} height={600} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 1000, milliseconds: 5000}} />
				<Scatterplot width={200} height={200} data={Helper.getIris()} settings={Helper.getIrisSettingsScatterplot()} stressTest={{elementCount: 1000, milliseconds: 5000}} />
			</div>
		);
	}
}

export default App;
