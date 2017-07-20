# Sonar Readme

## Structure of Session

With the login you receive select a session configuration file on the server. The session contains the QuickNGS datasets that are available for your Sonar session. 

Example:

```json
{
  "quickNGSDataPath": "some_path",
  "primaryDataset": "DIFFEXPR_EXPORT6945_DATASET10018.csv",
  "publicDatasets": [
    "link_1",
    "link_2",
    "link_3",
  ]
}
```

## Node Server

Implementation of Node server adapted from this repo: [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo).

The Node server lives in the root of the project folder. To make it work in the `create-react-app` environment that uses webpack we added it as proxy to the `client/package.json` (`"proxy": "http://localhost:3099/"`).

To start the development environment run:

```
<Project_Root>$ node server
<Project_Root/client>$ npm start
```

## Implementation Examples

### Rendering Graphics from `R` in `Sonar`


Get a graphic from `R`

```javascript
this.openCPU.runRCommand("graphics", "hist", { x: "[1,2,2,2,3,4,5,6,6,7]", breaks: 10}, 'ascii', false).then(output => {
  this.setState({
    image: `${output.graphics[0]}/svg`
  });
});
```

Include the image in HTML using

```html
<img src={`${this.state.image}?width=7&height=5`} width={400} height={200} alt="R test"/>
```

### Rendering `Sonar` Components

```html
<BarChart width={200} height={200} />
<Scatterplot width={200} height={200} x={Helper.getIris().sepalWidth} y={Helper.getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" />
<ScatterplotRNASeqData width={200} height={200} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" />
<ScatterplotRNASeqData width={600} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" />
<Hexplot width={600} height={400} rnaSeqData={Helper.getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" hexSize={10} hexMax={10} />
<Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/>
<Hexplot width={500} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={10} hexMax={10} />
```
