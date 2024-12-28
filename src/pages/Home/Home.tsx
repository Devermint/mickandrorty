import { useRef, useState } from 'react'
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
  Text,
  VStack,
} from '@chakra-ui/react'
import EvolutionPath from 'components/EvolutionPath/EvolutionPath'
import CurrentAgents from 'components/CurrentAgents/CurrentAgents'

const Home = () => {
  return (
    <Box>
      <EvolutionPath></EvolutionPath>
      <CurrentAgents></CurrentAgents>
    </Box>
  )
}

export default Home
