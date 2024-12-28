import React, { useState } from 'react'
import {
  Box,
  Button,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Image,
} from '@chakra-ui/react'
import { Agent } from 'components/CurrentAgents/CurrentAgents'

interface BuyFormProps {
  agent: Agent
}

const BuyForm: React.FC<BuyFormProps> = ({ agent }) => {
  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')

  const handlePayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPayAmount(value)
    setReceiveAmount((parseFloat(value) * 1).toFixed(2))
  }

  return (
    <Box bg="main.700" color="white" p={8} borderRadius="md" w="100%" mx="auto">
      <Text fontSize="xl" fontWeight="bold" mb={4} color="main.300">
        BUY {agent.name}
      </Text>
      <Flex gap="40px" align="center" justify="space-between">
        <VStack spacing={4} align="stretch" justify="space-around" w="40%">
          <Box>
            <Text mb={2}>Select currency</Text>
            <Select
              height={24}
              bg="main.700"
              color="white"
              border="1px solid"
              borderColor="main.200"
              mb={8}
            >
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </Select>
            <Text mb={2}>Pay</Text>
            <Input
              bg="main.700"
              color="white"
              borderColor="main.200"
              placeholder="0.00"
              value={payAmount}
              height={24}
              type="number"
              onChange={handlePayChange}
            />
          </Box>

          <Box>
            <Text mb={2}>Receive</Text>
            <Input
              bg="main.700"
              height={24}
              color="white"
              placeholder="0.00"
              borderColor="main.200"
              type="number"
              value={receiveAmount}
              readOnly
            />
          </Box>

          <Button variant="solid">BUY {agent.name}</Button>
        </VStack>

        <Box mt={8} w="60%">
          <Box bg="main.700" borderRadius="md" p={4}>
            <Image w="100%" src="/img/graph.png"></Image>
          </Box>
          <Flex justify="space-between" gap={4} align="center" mt={4}>
            <Stat bg="black" textAlign="center" p="10px" borderRadius="8px">
              <StatLabel color="main.200">Current Price</StatLabel>
              <StatNumber>$0.2027</StatNumber>
            </Stat>
            <Stat bg="black" textAlign="center" p="10px" borderRadius="8px">
              <StatLabel color="main.200">Market Cap</StatLabel>
              <StatNumber>$6.57M</StatNumber>
            </Stat>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default BuyForm
