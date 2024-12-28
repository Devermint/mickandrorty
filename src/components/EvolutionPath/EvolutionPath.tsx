import React from 'react'
import { Box, Image, Text, Grid, VStack } from '@chakra-ui/react'

const milestones = [
  {
    label: 'START',
    description: 'Rorty is that jittery, do-good teen tagging along, freaking out while t',
    image: '/img/rorty.png',
    milestone: 'milestone',
  },
  {
    label: '2M',
    description: 'Rorty is that jittery, do-good teen tagging along, freaking out while t',
    image: '/img/rorty.png',
    milestone: 'milestone',
  },
  {
    label: '4.5M',
    description: 'Rorty is that jittery, do-good teen tagging along, freaking out while t',
    image: '/img/rorty.png',
    milestone: 'milestone',
  },
  {
    label: '6M',
    description: 'Rorty is that jittery, do-good teen tagging along, freaking out while t',
    image: '/img/rorty.png',
    milestone: 'milestone',
  },
  {
    label: '7M',
    description: 'Rorty is that jittery, do-good teen tagging along, freaking out while t',
    image: '/img/rorty.png',
    milestone: 'milestone',
  },
  {
    label: '8M',
    description: 'Rorty is that jittery, do-good teen tagging along, freaking out while t',
    image: '/img/rorty.png',
    milestone: 'milestone',
  },
]

const EvolutionPath = () => {
  return (
    <Box color="white" p={{ base: 4, md: 8 }} textAlign="center">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" mb={4} textColor="main.300">
        AGENT EVOLUTION PATH
      </Text>
      <Box
        p={{ base: '16px', md: '24px 24px 20px 24px' }}
        bg="#131906"
        borderRadius="8px"
        border="1px solid #AFDC29"
      >
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          }}
          gap={6}
        >
          {milestones.map((milestone, index) => (
            <VStack
              key={index}
              bg="main.600"
              borderRadius="6px"
              p="8px 12px 16px 12px"
              spacing={4}
              textAlign="center"
            >
              <Text fontSize="lg" fontWeight="bold" textTransform="uppercase" textColor="main.300">
                {milestone.milestone}
              </Text>
              <Image
                src={milestone.image}
                alt={milestone.label}
                boxSize={{ base: '60px', md: '80px' }}
              />
              <Text fontSize="lg" fontWeight="bold">
                {milestone.label}
              </Text>
              <Text fontSize="sm">{milestone.description}</Text>
            </VStack>
          ))}
        </Grid>
        <Text fontSize="sm" mt={8} fontWeight="bold">
          EACH MILESTONE UNLOCKS NEW FEATURES BASED ON MARKET CAP ACHIEVEMENTS
        </Text>
      </Box>
    </Box>
  )
}

export default EvolutionPath
