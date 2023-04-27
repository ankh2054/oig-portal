import 'regenerator-runtime'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import 'react-tooltip/dist/react-tooltip.css'
import './index.css'
import { Anchor } from 'ual-anchor'
import { UALProvider } from 'ual-reactjs-renderer'

import App from './App'
import { store } from './store'

const appName = 'oig-portal'
const chain = {
  chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
  rpcEndpoints: [
    {
      host: 'wax.greymass.com',
      port: 443,
      protocol: 'https',
    },
  ],
}

const anchor = new Anchor([chain], { appName })
const root = ReactDOM.createRoot(document.getElementById('root')!)

if (process.env.NODE_ENV === 'development') {
  import('../mocks/browser')
    .then(({ worker }) => {
      worker.start()
    })
    .then(() => {
      root.render(
        <UALProvider
          chains={[chain]}
          authenticators={[anchor]}
          appName={appName}
        >
          <Provider store={store}>
            <App />
          </Provider>
        </UALProvider>
      )
    })
} else {
  root.render(
    <UALProvider chains={[chain]} authenticators={[anchor]} appName={appName}>
      <Provider store={store}>
        <App />
      </Provider>
    </UALProvider>
  )
}
