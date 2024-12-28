import React from 'react'
import { Box, Button, Flex, Grid, IconButton, Image, Text, VStack } from '@chakra-ui/react'
import { BsArrowRightCircle } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

export interface Agent {
  name: string
  description: string
  image: string
  stats: {
    label: string
    value: string
  }[]
}

const agents: Agent[] = [
  {
    name: 'MICK ZANCHES',
    description:
      "Yeah Rorty, I'm that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
    image: '/img/mick.png',
    stats: [
      { label: 'Funny', value: '9/10' },
      { label: 'Smart', value: '10/10' },
      { label: 'Cynical', value: '9/10' },
      { label: 'Compassionate', value: '10/10' },
    ],
  },
  {
    name: 'RORTY ZMITH',
    description:
      "Rorty is that jittery, do-good teen tagging along, freaking out while trying to stay 'nice' in a universe that doesn’t give a squanch.",
    image: '/img/rorty.png',
    stats: [
      { label: 'Funny', value: '5/10' },
      { label: 'Smart', value: '6/10' },
      { label: 'Anxious', value: '9/10' },
      { label: 'Kind', value: '8/10' },
    ],
  },
  {
    name: 'PICKLE MICK',
    description:
      "I turned myself into a pickle to dodge family therapy. I'm a genius! I'm a freakin' pickle, Rorty! I'm Pickle Mick!",
    image: '/img/pickle-mick.png',
    stats: [
      { label: 'Funny', value: '9/10' },
      { label: 'Smart', value: '10/10' },
      { label: 'Absurd', value: '10/10' },
      { label: 'Resourceful', value: '10/10' },
    ],
  },
  {
    name: 'PICKLE MICK 2',
    description:
      "I turned myself into a pickle to dodge family therapy. I'm a genius! I'm a freakin' pickle, Rorty! I'm Pickle Mick!",
    image: '/img/pickle-mick.png',
    stats: [
      { label: 'Funny', value: '9/10' },
      { label: 'Smart', value: '10/10' },
      { label: 'Absurd', value: '10/10' },
      { label: 'Resourceful', value: '10/10' },
    ],
  },
]

const CurrentAgents = () => {
  const navigate = useNavigate()

  const handleRedirect = agent => {
    navigate('/agent', {
      state: { agent },
    })
  }

  return (
    <Box color="white" p={8}>
      <Text fontSize="2xl" fontWeight="bold" mb={6} textTransform="uppercase" textColor="main.300">
        Current Agents
      </Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={6}>
        {agents.map((agent, index) => (
          <VStack
            key={index}
            border="1px solid #AFDC29"
            borderRadius="16px"
            p={4}
            spacing={4}
            align="center"
            justify="space-around"
          >
            <Image src={agent.image} alt={agent.name} boxSize="120px" />
            <Text fontSize="lg" fontWeight="bold" color="main.50" textAlign="center">
              {agent.name}
            </Text>
            <Text fontSize="sm" textAlign="center">
              {agent.description}
            </Text>
            <Box w="100%" mt={2}>
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {agent.stats.map((stat, statIndex) => (
                  <Box key={statIndex} textAlign="left" fontSize="sm">
                    <Text>{stat.label}</Text>
                    <Text fontWeight="bold" color="main.50">
                      {stat.value}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>

            <Button variant="solid" onClick={() => handleRedirect(agent)}>
              Select
            </Button>
          </VStack>
        ))}
        <Flex direction="column" justify="center" mt={4} align="center">
          <IconButton
            variant="unstyled"
            aria-label="see all"
            fontSize="68px"
            marginBottom="24px"
            color="main.200"
            icon={<BsArrowRightCircle />}
          >
            See All
          </IconButton>
          <Text color="main.200" fontSize="24px">
            See all
          </Text>
        </Flex>
      </Grid>
    </Box>
  )
}

export default CurrentAgents
