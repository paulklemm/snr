# Sonar Readme

## Project Roadmap

### Priority Legend

- 🔥 Must have
- 🤖 Normal
- 🏝 Nice to have

### ToDo

Overview over all tasks still left to do.

- [ ] 🏝 Create project homepage
- [ ] 🤖 Write documentation on how to set up the infrastructure
- [ ] 🤖 Create docker images
  - [ ] 🤖 Docker image for `R` back-end
  - [ ] 🤖 Docker image for `node` server and client
  - [ ] 🏝 Docker image for both
- [ ] 🔥 Include GO-Term analysis
- [ ] 🤖 Add Similarity Analysis based on ExpressionAtlas
- [ ] 🔥 Include Analyses from QuickNGS
- [ ] 🤖 Add Icon-visualization of each dataset in table
- [ ] 🔥 Add Metadata structure for each dataset to display in the client
  - [ ] 🔥 Implement Proper data transfer function between back- and front-end
- [ ] 🔥 Implement Analysis system of ArrayExpress data using either Kallisto or QuickNGS
- [ ] 🔥 Write paper
- [ ] 🔥 Add PCA plot including results from ArrayExpress/Kallisto
- [ ] 🔥 Conduct user studies
- [ ] 🤖 Create function to add new users

### Timeline

Development is divided into sprints to achieve milestones.

#### Sprint 1. Create presentable prototype - 31.08

- [ ] 🔥 Include GO-Term analysis
- [ ] 🔥 Add Metadata structure for each dataset to display in the client
  - [ ] 🔥 Implement Proper data transfer function between back- and front-end
- [ ] 🔥 Add PCA plot including results from ArrayExpress/Kallisto

#### Sprint 2. Incorporate public data - 29.09

- [ ] 🔥 Implement Analysis system of ArrayExpress data using either Kallisto or QuickNGS
- [ ] 🔥 Include Analyses from QuickNGS
- [ ] 🤖 Add Similarity Analysis based on ExpressionAtlas
- [ ] 🤖 Conduct first informal evaluation on prototype
- [ ] 🤖 Add Icon-visualization of each dataset in table

#### Sprint 3. Include user feedback - 31.10

- [ ] 🔥 Conduct user studies
  - [ ] 🔥 Respond to user feedback
- [ ] 🤖 Create function to add new users
- [ ] 🤖 Create docker images
  - [ ] 🤖 Docker image for `R` back-end
  - [ ] 🤖 Docker image for `node` server and client
  - [ ] 🏝 Docker image for both

#### Sprint 4. Write the paper and release the Software - 30.11

- [ ] 🔥 Maybe conduct second user study
  - [ ] 🔥 Respond to user feedback
- [ ] 🔥 Write paper
- [ ] 🏝 Create project homepage
- [ ] 🤖 Write documentation on how to set up the infrastructure

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

## Security

The `serversettings_json` file contains the path to the users file. A user file must contain `path` and `passwd` keys as follows.

```json
{
  "path": "/home/opencpu/sonar/data",
  "passwd": "$2a$10$GJl7RZ8xfKnLieVLPH3sMeAE/EM3Z2JVRI21/YDEaELMMbV3.XWhm",
}
```

On login, the password from the client side will be transmitted in clear text ([here is why](https://security.stackexchange.com/questions/93395/how-to-do-client-side-hashing-of-password-using-bcrypt)) to the server.

The server then compares the password against the hash stored in the users configuration file using `bcrypt`. If they match, a token is generated and returned to the client. The client stores the token in the HTML `localStorage`. In order to successfully run commands on the server, the client needs to transfer the token with every command. The server then checks if the tokens match up in the users configuration file and performs the command if it matches.

There is a maximum number of allowed tokens per user, which is per default set to `3`.
