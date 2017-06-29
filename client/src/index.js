import React from 'react';
import ReactDOM from 'react-dom';
// From https://material-ui-1dab0.firebaseapp.com/style/typography
import 'typeface-roboto';
import App from './components/App';
import './index.css';

const rootEl = document.getElementById('root');

ReactDOM.render(
  <App />,
  rootEl
);

// https://medium.com/superhighfives/hot-reloading-create-react-app-73297a00dcad
if (module.hot) {
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default
    ReactDOM.render(
      <NextApp />,
      rootEl
    )
  })
}