# Sonar Readme

## Project Roadmap

### Priority Legend

- 🔥 Must have
- 🤖 Normal
- 🏝 Nice to have

### ToDo

Development is divided into sprints to achieve milestones. Head over to [Issues](https://github.sf.mpg.de/pklemm/sonar/issues) for the ToDo List.

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

#### Not in sprints

- [ ] 🏝 Save sessions locally and on the server to exchange with people (maybe via link)
  - Maybe using a bookmark system

## Structure of Data and OpenCPU Sessions

The data folder looks as follows:

```
data
├── arrayexpress
├── arrayexpressquickngs
├── expressionatlas
├── sessions.json
└── users
    ├── debug
    └── paul
```

Loading all data on client connect requires a lot of time. Therefore loading is cached.

The `sessions.json` file contains OpenCPU session ids for each user as well as the different data sources. The file is parsed by the `sonaR` `get_session()` function. It loads the session from the `sessions.json` file and checks if all data sets are loaded by checking the `R` list against the respective folder contents. This way, data loading is only triggered if there are changes in the `data` folder.

## Data Layout

To account for data from different sources, each file in the user folder should be accompanied with a descriptive `json` file following the following format:

```json
{
  source: kallisto/sleuth,
  mapping: {
    fc = log2(fold_change),
    pValue = p_value,
    ensembl_gene_id = ensemblID,
    ensembl_transcript_id = ensembl_transcriptID
  }

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
