import React from 'react'
import { Box, Text, HStack, VStack, Image, Badge, Button, Flex } from '@chakra-ui/react'
import { FaArrowRightLong } from 'react-icons/fa6'

const ChatCard = ({ communityName, category, subscribers, postReach, citationIndex }) => {
  return (
    <Flex
      bg="main.700"
      borderRadius="md"
      border="1px solid"
      borderColor="main.300"
      p={4}
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'stretch', md: 'center' }}
      justify="space-between"
      mb={4}
      w="100%"
    >
      <HStack spacing={4} mb={{ base: 4, md: 0 }}>
        <Image
          src="/img/mick.png"
          alt="Community Icon"
          boxSize="60px"
          borderRadius="md"
          border="1px solid"
          borderColor="main.300"
        />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" color="main.300" fontSize="lg">
            {communityName}
          </Text>
          <Badge
            bg={category === 'Telegram' ? 'purple.500' : 'teal.500'}
            color="white"
            fontSize="xs"
            px={2}
            borderRadius="md"
          >
            {category}
          </Badge>
        </VStack>
      </HStack>

      <HStack
        spacing={{ base: 4, md: 8 }}
        wrap={{ base: 'wrap', md: 'nowrap' }}
        justify={{ base: 'space-between', md: 'center' }}
        mb={{ base: 4, md: 0 }}
      >
        <VStack spacing={0} align="center">
          <Text fontWeight="bold" fontSize="lg" color="white">
            {subscribers}
          </Text>
          <Text fontSize="xs" color="gray.400">
            subscribers
          </Text>
        </VStack>
        <VStack spacing={0} align="center">
          <Text fontWeight="bold" fontSize="lg" color="white">
            {postReach}
          </Text>
          <Text fontSize="xs" color="gray.400">
            1 post reach
          </Text>
        </VStack>
        <VStack spacing={0} align="center">
          <Text fontWeight="bold" fontSize="lg" color="white">
            {citationIndex}
          </Text>
          <Text fontSize="xs" color="gray.400">
            citation index
          </Text>
        </VStack>
      </HStack>
      <Button
        variant="solid"
        rightIcon={<FaArrowRightLong />}
        alignSelf={{ base: 'center', md: 'flex-end' }}
      >
        Open
      </Button>
    </Flex>
  )
}

export default ChatCard
