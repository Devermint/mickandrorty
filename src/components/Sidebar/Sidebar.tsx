import React from 'react'
import { Box, VStack, Text, Link, HStack, Icon } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { FaHome, FaInfoCircle, FaEnvelope } from 'react-icons/fa'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { IoChatbubbleOutline } from 'react-icons/io5'
import { GrGroup } from 'react-icons/gr'
import { RiExchange2Line } from 'react-icons/ri'

const Sidebar = () => {
  const location = useLocation()
  const links = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/create', label: 'Create', icon: IoMdAddCircleOutline },
    { href: '/chats', label: 'My Chats', icon: IoChatbubbleOutline },
    { href: '/community', label: 'Community', icon: GrGroup },
    { href: '/stake', label: 'Stake', icon: RiExchange2Line },
  ]

  return (
    <Box pt={4}>
      <VStack align="center" spacing={4} justify="center">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            display="flex"
            alignItems="center"
            _hover={{ textDecoration: 'none', color: 'main.200' }}
            color={location.pathname === href ? 'main.50' : 'main.400'}
          >
            <VStack spacing={3}>
              <Icon as={icon} boxSize={5} />
              <Text fontSize="12px">{label}</Text>
            </VStack>
          </Link>
        ))}
      </VStack>
    </Box>
  )
}

export default Sidebar
