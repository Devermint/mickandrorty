import React, { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  VStack,
  Avatar,
  Flex,
  IconButton,
  Grid,
} from '@chakra-ui/react'
import { AiOutlineSend } from 'react-icons/ai'

interface Agent {
  name: string
  description: string
  image: string
  stats: {
    label: string
    value: string
  }[]
}

interface ChatProps {
  agent: Agent
}

const AgentChat: React.FC<ChatProps> = ({ agent }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; content: string }[]>([
    { sender: 'agent', content: agent.description },
  ])

  const [currentMessage, setCurrentMessage] = useState('')

  const handleSendMessage = () => {
    if (currentMessage.trim() === '') return

    setMessages(prev => [
      ...prev,
      { sender: 'user', content: currentMessage },
      { sender: 'agent', content: agent.description },
    ])
    setCurrentMessage('')
  }

  return (
    <Box
      bg="main.700"
      color="white"
      p="32px"
      w="100%"
      borderRadius="md"
      mx="auto"
      height="500px"
      display="flex"
      flexDirection="column"
    >
      <VStack
        flex="1"
        overflowY="auto"
        spacing={4}
        bg="#020302"
        borderRadius="8px 8px 0px 0px"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor="main.200"
        p={4}
      >
        {messages.map((message, index) => (
          <Flex
            key={index}
            justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            width="100%"
          >
            {message.sender === 'agent' && (
              <HStack align="start" spacing={3} alignContent="center">
                <Avatar src={agent.image} size="md" border="1px solid #AFDC29" />
                <Flex direction="column">
                  <Text fontWeight="bold" mb={1} color="main.200">
                    {agent.name.toUpperCase()}
                  </Text>
                  <Box
                    bg="black"
                    color="white"
                    borderRadius="lg"
                    p={3}
                    maxWidth="70%"
                    border="1px solid"
                    borderColor="main.200"
                  >
                    <Text>{message.content}</Text>
                  </Box>
                </Flex>
              </HStack>
            )}

            {message.sender === 'user' && (
              <Grid templateColumns="repeat(1, 1fr)" justifyItems="end">
                <Text fontWeight="bold" mb={1} textAlign="right">
                  YOU
                </Text>
                <Box
                  bg="main.800"
                  borderRadius="lg"
                  color="white"
                  textAlign="left"
                  p={3}
                  maxWidth="70%"
                  minWidth="200px"
                  wordBreak="break-word"
                  whiteSpace="normal"
                  overflowWrap="anywhere"
                >
                  <Text>{message.content}</Text>
                </Box>
              </Grid>
            )}
          </Flex>
        ))}
      </VStack>
      <HStack gap={0}>
        <Input
          placeholder="Your message..."
          bg="main.700"
          color="white"
          borderLeft="1px solid"
          borderBottom="1px solid"
          borderRight="1px solid"
          borderTop="none"
          borderRadius="0px 0px 0px 8px"
          borderColor="main.200"
          value={currentMessage}
          onChange={e => setCurrentMessage(e.target.value)}
        />
        <IconButton
          icon={<AiOutlineSend />}
          aria-label="Send Message"
          bg="main.300"
          color="black"
          borderRadius="0px 0px 8px 0px"
          onClick={handleSendMessage}
        />
      </HStack>
    </Box>
  )
}

export default AgentChat
