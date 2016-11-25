import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import './main.scss';
import '../lib/luciad/resources/css/luciad.css';
import App from './components/App';

var rootEl = document.getElementById('root');

ReactDOM.render(
  <App />,
  rootEl
);

if (module.hot) {
  module.hot.accept('./components/App', function() {
    var NextApp = require('./components/App').default;
    ReactDOM.render(<NextApp />, rootEl);
  });
}