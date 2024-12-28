import { useRef, useState } from 'react'
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
  Text,
  VStack,
  Badge,
  Button,
  Input,
  Stack,
  Image,
  useColorModeValue,
  Grid,
} from '@chakra-ui/react'
import EvolutionPath from 'components/EvolutionPath/EvolutionPath'
import CurrentAgents, { Agent } from 'components/CurrentAgents/CurrentAgents'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useLocation } from 'react-router-dom'
import BuyForm from 'components/BuyForm/BuyForm'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import AgentChat from 'components/AgentChat/AgentChat'

const AgentView = () => {
  const location = useLocation()
  const agent = location.state.agent as Agent
  console.log(agent)

  return agent.name ? (
    <Box>
      <Flex mb="16px" mt="32px" mx="24px" justify="flex-start" align="center">
        <Button leftIcon={<AiOutlineArrowLeft />} variant="outline" as={Link} to="/">
          Back
        </Button>
        <Text>{agent.name}</Text>
      </Flex>
      <Flex>
        <Box w="45%" mx="24px">
          <VStack
            border="1px solid #AFDC29"
            borderRadius="16px"
            p={4}
            spacing={4}
            align="center"
            justify="space-around"
          >
            <Image src={agent.image} alt={agent.name} boxSize="340px" />
            <Text fontSize="4xl" fontWeight="bold" color="main.50" textAlign="center">
              {agent.name}
            </Text>
            <Text fontSize="2xl" textAlign="center">
              {agent.description}
            </Text>
            <Box w="100%" mt={2}>
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {agent.stats.map((stat, statIndex) => (
                  <Box key={statIndex} textAlign="left" fontSize="sm">
                    <Text fontSize="xl">{stat.label}</Text>
                    <Text fontSize="xl" fontWeight="bold" color="main.50">
                      {stat.value}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>

            <Button variant="solid">Select</Button>
          </VStack>
        </Box>
        <Flex direction="column" w="100%" gap="24px">
          <BuyForm agent={agent}></BuyForm>
          <AgentChat agent={agent}></AgentChat>
        </Flex>
      </Flex>
    </Box>
  ) : (
    <></>
  )
}

export default AgentView
