import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Link,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import ConnectWallet from 'components/ConnectWallet/ConnectWallet'
import TelegramLogin from 'components/ConnectWallet/TelegramLogin'
import { FaHome } from 'react-icons/fa'
import { GrGroup } from 'react-icons/gr'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { IoChatbubbleOutline } from 'react-icons/io5'
import { RiExchange2Line } from 'react-icons/ri'

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const links = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/create', label: 'Create', icon: IoMdAddCircleOutline },
    { href: '/chats', label: 'My Chats', icon: IoChatbubbleOutline },
    { href: '/community', label: 'Community', icon: GrGroup },
    { href: '/stake', label: 'Stake', icon: RiExchange2Line },
  ]

  return (
    <Box borderBottom="1px solid #3D4916" bg="main.500">
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" justify="space-between">
          <Heading size="sm" textTransform="uppercase">
            <Image src="/img/logo.png" w="128px"></Image>
          </Heading>
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
        </Flex>
        <Flex alignItems="center" mx={4}>
          <TelegramLogin />
          <ConnectWallet />
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }} textAlign="center">
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
      ) : null}
    </Box>
  )
}
