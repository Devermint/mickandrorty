import React from 'react'
import { Box, Text, Image, Grid, Flex, Link, VStack, HStack } from '@chakra-ui/react'

interface StatBarProps {
  label: string
  value: number
  maxValue: number
}

const StatBar: React.FC<StatBarProps> = ({ label, value, maxValue }) => (
  <Flex justify="space-between" align="center" mb={2}>
    <Text color="gray.300">{label}</Text>
    <HStack spacing={2}>
      <Text color="green.400">
        {value}/{maxValue}
      </Text>
    </HStack>
  </Flex>
)

interface AgentCardProps {
  name: string
  title: string
  description: string
  image: string
  stats: {
    funny: number
    smart: number
    cynical: number
    compassionate: number
  }
  socialLinks?: {
    telegram?: string
    twitter?: string
  }
}

const AgentCard: React.FC<AgentCardProps> = ({
  name,
  title,
  description,
  image,
  stats,
  socialLinks,
}) => {
  return (
    <Box
      maxW="sm"
      bg="blackAlpha.800"
      borderWidth="1px"
      borderColor="green.900"
      borderRadius="lg"
      boxShadow="lg"
    >
      <Box position="relative">
        <Image src={image} alt={name} borderTopRadius="lg" w="full" />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={4}
          bgGradient="linear(to-t, blackAlpha.900, transparent)"
        >
          <Text color="green.400" fontSize="xl" fontFamily="mono">
            {name}
          </Text>
          <Text color="gray.400" textTransform="uppercase">
            {title}
          </Text>
        </Box>
      </Box>

      <VStack p={4} align="stretch" spacing={4}>
        <Text color="gray.300" fontFamily="mono">
          {description}
        </Text>

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <StatBar label="Funny" value={stats.funny} maxValue={10} />
          <StatBar label="Smart" value={stats.smart} maxValue={10} />
          <StatBar label="Cynical" value={stats.cynical} maxValue={10} />
          <StatBar label="Compassionate" value={stats.compassionate} maxValue={10} />
        </Grid>

        {socialLinks && (
          <HStack spacing={2}>
            {socialLinks.telegram && (
              <Link
                href={socialLinks.telegram}
                bg="green.900"
                opacity={0.3}
                p={2}
                borderRadius="md"
                _hover={{ opacity: 0.5 }}
                transition="opacity 0.2s"
              >
                <Text color="green.400">📱</Text>
              </Link>
            )}
            {socialLinks.twitter && (
              <Link
                href={socialLinks.twitter}
                bg="green.900"
                opacity={0.3}
                p={2}
                borderRadius="md"
                _hover={{ opacity: 0.5 }}
                transition="opacity 0.2s"
              >
                <Text color="green.400">𝕏</Text>
              </Link>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  )
}

export default AgentCard
