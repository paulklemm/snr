# ⚓️ Sonar Readme

<!-- TOC -->

* [⚓️ Sonar Readme](#⚓️-sonar-readme)
  * [License](#license)
  * [Project Roadmap](#project-roadmap)
    * [ToDo](#todo)
      * [Not in sprints](#not-in-sprints)
  * [Structure of Data and OpenCPU Sessions](#structure-of-data-and-opencpu-sessions)
  * [Data Layout & Metadata](#data-layout--metadata)
  * [Node Server](#node-server)
  * [Implementation Examples](#implementation-examples)
    * [Pass an Array to `R`](#pass-an-array-to-r)
    * [Rendering Graphics from `R` in `Sonar`](#rendering-graphics-from-r-in-sonar)
    * [Rendering `Sonar` Components](#rendering-sonar-components)
  * [🐳 Deployment Using pm2 in Docker image](#🐳-deployment-using-pm2-in-docker-image)
  * [Security](#security)
    * [Generate User file](#generate-user-file)
    * [Workflow for creating a new user](#workflow-for-creating-a-new-user)

<!-- /TOC -->

## License

Until release of the paper presenting SNR it is under the restrictive **Attribution-NonCommercial-NoDerivatives 4.0 International** license. After that we'll switch to the **MIT** license.

## Project Roadmap

### ToDo

Priority Legend:

* 🔥 Must have
* 🤖 Normal
* 🏝 Nice to have

Development is divided into sprints to achieve milestones. Head over to [Issues](https://github.sf.mpg.de/pklemm/sonar/issues) for the ToDo list.

* [ ] 🏝 Create project homepage
* [ ] 🤖 Write documentation on how to set up the infrastructure
* [ ] 🤖 Create docker images
  * [ ] 🤖 Docker image for `R` back-end
  * [ ] 🤖 Docker image for `node` server and client
  * [ ] 🏝 Docker image for both
* [ ] 🔥 Include GO-Term analysis
* [ ] 🤖 Add Similarity Analysis based on ExpressionAtlas
* [ ] 🔥 Include Analyses from QuickNGS
* [ ] 🤖 Add Icon-visualization of each dataset in table
* [ ] 🔥 Add Metadata structure for each dataset to display in the client
  * [ ] 🔥 Implement Proper data transfer function between back- and front-end
* [ ] 🔥 Implement Analysis system of ArrayExpress data using either Kallisto or QuickNGS
* [ ] 🔥 Write paper
* [ ] 🔥 Add PCA plot including results from ArrayExpress/Kallisto
* [ ] 🔥 Conduct user studies
* [ ] 🤖 Create function to add new users

#### Not in sprints

* [ ] 🏝 Save sessions locally and on the server to exchange with people (maybe via link)
  * Maybe using a bookmark system

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

The `sessions.json` file contains OpenCPU session ids for each user as well as the different data sources. The file is parsed by the `sonaR` `get_session()` function. It loads the session from the `sessions.json` file and checks if all data sets are loaded by checking the `R` list against the respective folder contents. This way, data loading is only triggered if there are changes in the `data` folder. Example for the `sessions.json` file

```json
{
  "paul": "x08ed07538b",
  "debug": "x0d6410f0cc"
}
```

## Data Layout & Metadata

To account for data from different sources, each file in the user folder should be accompanied with a descriptive `json` file following the following format:

```json
{
  "source": "kallisto/sleuth",
  "mapping": {
    "fc": "log2(fold_change)",
    "pValue": "p_value",
    "ensembl_gene_id": "ensemblID",
    "ensembl_transcript_id": "ensembl_transcriptID"
  },
  "regex": {
    "FPKM": "FPKM$"
  },
  "metadata": {
    "Species": "Mus musculus",
    "Experimental Conditions": "",
    "Number of Samples": 10,
    "Genotypes": [],
    "Phenotypes": []
  }
}
```

This file can also be called `dictionary.json` and then acts as fallback configuration for all files in a folder if there is no specific dictionary file provided for a dataset.

The `dictionary.json` file is also used to add _metadata_ to each dataset. All the available metadata will be displayed by Sonar.

Currently the metadata facilities are rather restricted. The elements will be displayed as they are on the first nesting level. There are, however, no special handling or URLs or similar things. This needs to be enhanced soon.

## Node Server

Implementation of Node server adapted from this repo: [https://github.com/fullstackreact/food-lookup-demo](https://github.com/fullstackreact/food-lookup-demo).

The Node server lives in the root of the project folder. To make it work in the `create-react-app` environment that uses webpack we added it as proxy to the `client/package.json` (`"proxy": "http://localhost:3099/"`).

To start the development environment run:

```
<Project_Root>$ node server
<Project_Root/client>$ npm start
```

## Implementation Examples

### Pass an Array to `R`

The ajax request used to pass arguments to the `OpenCPU` back-end server needs to be provided with arrays as a string or as a string of an `R` array (e.g. `'c(1,2,3)'`).

```javascript
// Show how to pass arrays into OpenCPU
openCPU
  .runRCommand('base', 'mean', { x: 'c(1, 2, 3, 4, 5, 6)' }, 'json')
  .then(result => {
    timeStampLog(JSON.stringify(result, null, 2));
  });
// Alternative
openCPU
  .runRCommand('base', 'mean', { x: '[1, 2, 3, 4, 5, 6]' }, 'json')
  .then(result => {
    timeStampLog(JSON.stringify(result, null, 2));
  });
```

### Rendering Graphics from `R` in `Sonar`

Get a graphic from `R`

```javascript
this.openCPU
  .runRCommand(
    'graphics',
    'hist',
    { x: '[1,2,2,2,3,4,5,6,6,7]', breaks: 10 },
    'ascii',
    false
  )
  .then(output => {
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
<Scatterplot width={200} height={200} x={getIris().sepalWidth} y={getIris().sepalLength} xLabel="Sepal Width" yLabel="Sepal Length" />
<ScatterplotRNASeqData width={200} height={200} rnaSeqData={getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" />
<ScatterplotRNASeqData width={600} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" />
<Hexplot width={600} height={400} rnaSeqData={getIrisNewFormat()} xName="sepalWidth" yName="sepalLength" hexSize={10} hexMax={10} />
<Piechart width={200} height={200} data={[1, 1, 2, 3, 5, 8, 13, 21]}/>
<Hexplot width={500} height={400} rnaSeqData={this.state.rnaSeqData} xName="pValue" yName="fc" hexSize={10} hexMax={10} />
```

## 🐳 Deployment Using pm2 in Docker image

In the docker image ([https://github.com/snr-vis/snr-docker](https://github.com/snr-vis/snr-docker)) the node server is started using [pm2](http://pm2.keymetrics.io). For this we provided a `snr-node-server.json` file that provides the required info. It is launched using:

```bash
pm2 <path-to-snr>/snr-node-server.json
```

## Security

The `server_settings.json` file contains the path to the users file. A user file must contain `path` and `passwd` keys as follows.

```json
{
  "path": "/home/opencpu/sonar/data",
  "passwd": "$2a$10$GJl7RZ8xfKnLieVLPH3sMeAE/EM3Z2JVRI21/YDEaELMMbV3.XWhm"
}
```

On login, the password from the client side will be transmitted in clear text ([here is why](https://security.stackexchange.com/questions/93395/how-to-do-client-side-hashing-of-password-using-bcrypt)) to the server.

The server then compares the password against the hash stored in the users configuration file using `bcrypt`. If they match, a token is generated and returned to the client. The client stores the token in the HTML `localStorage`. In order to successfully run commands on the server, the client needs to transfer the token with every command. The server then checks if the tokens match up in the users configuration file and performs the command if it matches.

There is a maximum number of allowed tokens per user, which is per default set to `3`.

### Generate User file

The server's API allows the create a user file by specifying path and password by calling: `http://<url_to_server>:<port>/api/makeuserfilejson?pw=mypassword&path=/home/opencpu/sonar/data`. You can use the response to create or edit the user files.

### Workflow for creating a new user

1.  Create a new folder for the user in the folder that is linked to the `docker` `R` back-end and add the data there
1.  Create a `dictionary.json` file in that folder (see [Structure of Data and OpenCPU Sessions](#structure-of-data-and-opencpu-sessions))
1.  Check `server_settings.json` file where the user configuration files are
1.  Go to this directory and save the output of `http://<url_to_server>:<port>/api/makeuserfilejson?pw=<user_password>&path=<path_to_data_on_r_back_end>` to `<username>.json`
1.  Log in to sonar with the new account
