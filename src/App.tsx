import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Box, Heading, Spinner, Image, Flex } from '@chakra-ui/react'
import './index.css'
import Navbar from 'components/Navbar/Navbar'
import { Sidebar } from 'components'

import '@rainbow-me/rainbowkit/styles.css'

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { config } from './utils/config'
import Home from 'pages/Home'
import AgentView from 'pages/AgentView'
import Create from 'pages/Create'
import Chats from 'pages/Chats'
import Community from 'pages/Community/Community'

function App() {
  const queryClient = new QueryClient()

  return (
    <div className="App">
      <Box className="noise" />
      <BrowserRouter>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <Flex h="100vh" direction="column">
                <Box w="100%" bg="main.500" textColor="main.50" borderBottom="1px solid #3D4916">
                  <Navbar />
                </Box>

                <Flex flex="1">
                  <Box
                    display={{ base: 'none', md: 'inline' }}
                    w="80px"
                    bg="main.500"
                    textColor="main.50"
                    borderColor="main.400"
                    borderRight="1px solid #3D4916"
                  >
                    <Sidebar />
                  </Box>

                  <Box flex="1" p={4}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/agent" element={<AgentView />} />
                      <Route path="/create" element={<Create />} />
                      <Route path="/chats" element={<Chats />} />
                      <Route path="/community" element={<Community />} />
                    </Routes>
                  </Box>
                </Flex>
              </Flex>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
