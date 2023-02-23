import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { Anchor } from 'ual-anchor';
import { Wax } from '@eosdacio/ual-wax';

import { UALProvider, withUAL } from 'ual-reactjs-renderer';

const waxChain = {
  chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'wax.greymass.com',
    port: '443',
  }]
}

const AppWithUAL = withUAL(App);
const appName = "OIG Admin Portal";
const anchor = new Anchor([waxChain], { appName: appName });
const waxcloud = new Wax([waxChain], { appName: appName });

// Strict mode is a good idea: https://reactjs.org/docs/strict-mode.html
ReactDOM.render(
   <UALProvider chains={[waxChain]} authenticators={[waxcloud, anchor ]} appName={appName}>
     <Router>
        <AppWithUAL />
     </Router>,
   </UALProvider>,
 document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
