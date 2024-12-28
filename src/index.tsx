import React from 'react'
import ReactDOM from 'react-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from 'styles/theme'
import App from './App'
import '@rainbow-me/rainbowkit/styles.css'
import { createRoot } from 'react-dom/client'

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID ?? ''
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL ?? ''

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
