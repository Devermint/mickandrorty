import React, { useState } from 'react'
import { Box, VStack, Text, Input, Button, Image, HStack, Flex, Grid } from '@chakra-ui/react'
import { Agent } from 'components/CurrentAgents/CurrentAgents'

const CreateForm = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Agent>({} as any)

  const characters: Agent[] = [
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
  ]

  const handleCharacterSelect = character => {
    setSelectedCharacter(character)
  }

  return (
    <Flex w="100%" direction={{ base: 'column', md: 'row' }}>
      <Box
        color="white"
        p="32px"
        maxW={{ base: '90%', md: '50%', lg: '30%' }}
        bg="black"
        borderRadius="md"
      >
        <VStack spacing={4} align="stretch">
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight="bold"
            textAlign="center"
            color="main.200"
          >
            CREATE YOUR OWN
          </Text>

          <Box>
            <Text fontSize="sm" mb={1}>
              Twitter/X persona link
            </Text>
            <Input
              placeholder="Copy URL from Twitter/X"
              bg="main.400"
              borderColor="main.200"
              focusBorderColor="main.50"
              _placeholder={{ color: 'gray.400' }}
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={2}>
              Choose a character
            </Text>
            <HStack spacing={2} justify="center" flexWrap="wrap">
              {characters.map(char => (
                <Box
                  key={char.name}
                  border={
                    selectedCharacter.name === char.name
                      ? '2px solid #AFDC29'
                      : '2px solid transparent'
                  }
                  borderRadius="md"
                  background={selectedCharacter.name === char.name ? 'main.600' : 'main.700'}
                  cursor="pointer"
                  onClick={() => handleCharacterSelect(char)}
                  p={2}
                >
                  <Image src={char.image} alt={char.name} boxSize={{ base: '80px', md: '100px' }} />
                </Box>
              ))}
            </HStack>
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Blurb img
            </Text>
            <Input
              placeholder="Img URL"
              bg="main.400"
              borderColor="main.200"
              focusBorderColor="main.50"
              _placeholder={{ color: 'gray.400' }}
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Name
            </Text>
            <Input
              placeholder="Enter your name"
              bg="main.400"
              borderColor="main.200"
              focusBorderColor="main.50"
              _placeholder={{ color: 'gray.400' }}
            />
          </Box>

          <Button variant="outline" w="100%" size={{ base: 'sm', md: 'md' }}>
            Join to Twitter/X
          </Button>
          <HStack spacing={4} justify="center" mt={4} flexWrap="wrap">
            <Button
              variant="solid"
              w={{ base: '100%', md: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
            >
              Create LP
            </Button>
            <Button
              variant="outline"
              w={{ base: '100%', md: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
            >
              Join to TG
            </Button>
          </HStack>
        </VStack>
      </Box>
      <Box p="32px">
        <HStack gap={16} justify="center" align="center">
          <Image display={{ base: 'none', md: 'inline' }} src="/img/creation.png" w="30%"></Image>
          <Box display="flex" justifyContent="center" width="100%">
            {selectedCharacter.name ? (
              <VStack
                border="1px solid #AFDC29"
                borderRadius="16px"
                p={4}
                spacing={4}
                align="center"
                w="100%"
                maxW="320px"
                justify="center"
              >
                <Image src={selectedCharacter.image} alt={selectedCharacter.name} boxSize="120px" />
                <Text fontSize="lg" fontWeight="bold" color="main.50" textAlign="center">
                  {selectedCharacter.name}
                </Text>
                <Text fontSize="sm" textAlign="center">
                  {selectedCharacter.description}
                </Text>
                <Box w="100%" mt={2}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    {selectedCharacter.stats.map((stat, statIndex) => (
                      <Box key={statIndex} textAlign="left" fontSize="sm">
                        <Text>{stat.label}</Text>
                        <Text fontWeight="bold" color="main.50">
                          {stat.value}
                        </Text>
                      </Box>
                    ))}
                  </Grid>
                </Box>
              </VStack>
            ) : (
              <></>
            )}
          </Box>
        </HStack>
      </Box>
    </Flex>
  )
}

export default CreateForm
