import React from 'react'
import { Button, Flex, Spinner } from '@chakra-ui/react'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

const ConnectWallet = () => {
  const { address, isConnected, isConnecting } = useAccount()

  const { openConnectModal } = useConnectModal()

  const wallectConnectButton = () => {
    if (!address) {
      return (
        <Button variant="solid" onClick={openConnectModal}>
          Sign in
        </Button>
      )
    }

    if (isConnecting) {
      return <Spinner size="lg" />
    }

    if (address && !isConnected) {
      return (
        <Button variant="solid" onClick={openConnectModal}>
          Sign in
        </Button>
      )
    }

    return null
  }

  return (
    <>
      {address && isConnected ? (
        <Flex alignItems="center">
          <ConnectButton></ConnectButton>
        </Flex>
      ) : (
        <>{wallectConnectButton()}</>
      )}
    </>
  )
}

export default ConnectWallet
