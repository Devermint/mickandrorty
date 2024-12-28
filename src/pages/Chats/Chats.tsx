import { useRef, useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import ChatCard from 'components/ChatCard/ChatCard'

const Chats = () => {
  const chatData = [
    {
      communityName: 'NAME OF COMMUNITY',
      category: 'Cryptocurrencies',
      subscribers: '46 328 925',
      postReach: '36.3 m',
      citationIndex: 264,
    },
    {
      communityName: 'NAME OF COMMUNITY',
      category: 'Telegram',
      subscribers: '46 328 925',
      postReach: '36.3 m',
      citationIndex: 264,
    },
    {
      communityName: 'NAME OF COMMUNITY',
      category: 'Cryptocurrencies',
      subscribers: '46 328 925',
      postReach: '36.3 m',
      citationIndex: 264,
    },
  ]

  return (
    <Box bg="black" color="white" p={8}>
      <Text fontWeight="bold" fontSize="2xl" mb={4} color="main.200">
        MY CHATS
      </Text>
      {chatData.map((chat, index) => (
        <ChatCard key={index} {...chat} />
      ))}
    </Box>
  )
}

export default Chats
