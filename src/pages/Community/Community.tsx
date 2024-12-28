import { useRef, useState } from 'react'
import { Badge, Box, Button, Flex, HStack, IconButton, Image, Text, VStack } from '@chakra-ui/react'
import ChatCard from 'components/ChatCard/ChatCard'
import { FaHeart, FaReply, FaShareAlt } from 'react-icons/fa'
import { Timeline } from 'react-twitter-widgets'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Community = () => {
  // Example chart data
  const data = {
    labels: ['09/14', '09/15', '09/16', '09/17', '09/18'],
    datasets: [
      {
        label: 'Followers Growth',
        data: [20, 40, 50, 70, 90],
        borderColor: '#00FF00',
        fill: false,
      },
      {
        label: 'Engagement Rate',
        data: [10, 30, 60, 50, 80],
        borderColor: '#00FFFF',
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true, color: '#333' } },
    },
  }

  return (
    <Flex w="100%" borderRadius="md" direction={{ base: 'column', md: 'row' }} gap={4}>
      <Box
        w={{ base: '100%', md: '30%' }}
        mb={{ base: 4, md: 0 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Timeline
          dataSource={{
            sourceType: 'profile',
            screenName: 'elonmusk',
          }}
          options={{
            height: '400',
            width: '100%',
            theme: 'dark',
            borderRadius: '10px',
          }}
        />
      </Box>

      <VStack spacing={4} flex={1}>
        <Flex w="100%" direction={{ base: 'column', md: 'row' }} justify="space-between" gap={4}>
          <VStack
            bg="main.700"
            p={4}
            borderRadius="md"
            border="1px solid"
            borderColor="main.500"
            flex={1}
            align="center"
          >
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="main.300">
              233
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.300">
              SCORE
            </Text>
          </VStack>
          <VStack
            bg="main.700"
            p={4}
            borderRadius="md"
            border="1px solid"
            borderColor="main.500"
            flex={1}
            align="center"
          >
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="main.300">
              30.32k
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.300">
              FOLLOWERS
            </Text>
          </VStack>
        </Flex>

        <Box
          width="100%"
          mx="auto"
          p={4}
          height={{ base: '200px', md: '300px' }}
          bg="main.700"
          borderRadius="md"
          border="1px solid"
          borderColor="main.500"
        >
          <Line data={data} options={{ ...options, maintainAspectRatio: false }} />
        </Box>
      </VStack>
    </Flex>
  )
}

export default Community
