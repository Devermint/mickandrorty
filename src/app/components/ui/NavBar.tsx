"use client";

import { Flex, Text, Box } from '@chakra-ui/react'
import HomeIcon from '../icons/home'
import CreateIcon from '../icons/create'
import ChatsIcon from '../icons/chats'
import CommunityIcon from '../icons/community'
import StakeIcon from '../icons/stake'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const BaseIconColor = "#99B637"
const ActiveIconColor = "#000000"
const ActiveBackgroundColor = "#AFDC29"

const NavButtonsInitial = [
    { active: false, text: "Home", icon: HomeIcon, page: "/home" },
    { active: false, text: "Create", icon: CreateIcon, page: "/create" },
    { active: false, text: "My Chats", icon: ChatsIcon, page: "/chats" },
    { active: false, text: "Community", icon: CommunityIcon, page: "/community" },
    { active: false, text: "Stake", icon: StakeIcon, page: "/stake" }
]

type NavBarButtonProps = {
    text: string
    backgroundColor?: string
    icon: React.ReactElement
    onClick: (id: string) => void
}

function NavBarButton(props: NavBarButtonProps) {
    return (
        <Flex direction="column" alignItems="center" cursor="pointer" padding="0.25rem" onClick={() => props.onClick(props.text)}>
            <Box width="36px" height="36px" alignContent="center" justifyItems="center" backgroundColor={props.backgroundColor} borderRadius="4px">
                {props.icon}
            </Box>
            <Text userSelect="none" fontWeight="400" fontSize="10px" lineHeight="14px">{props.text}</Text>
        </Flex>
    )
}

export default function NavBar() {
    const [navButtons, setNavButtons] = useState(NavButtonsInitial)
    const router = useRouter();
    const pathname = usePathname()

    const handleButtonClick = (id: string) => {
        navButtons.forEach(button => {
            button.active = button.text === id
        })

        router.push(navButtons.find(button => button.text === id)!.page)
    }

    useEffect(() => {
        navButtons.forEach(button => {
            button.active = button.page === pathname
        })

        setNavButtons([...navButtons])
    }, [pathname])

    return (
        <Box position="fixed" bottom="0" width="100%" mb="2rem">
            <Flex borderRadius="21px" background="#3D3E3A1A" justify="center" justifySelf="center" padding="0.5rem" gap="2rem">
                {navButtons.map((button, index) => (
                    <NavBarButton key={index} text={button.text} onClick={handleButtonClick} icon={button.icon(button.active ? ActiveIconColor : BaseIconColor)} backgroundColor={button.active ? ActiveBackgroundColor : undefined} />
                ))}
            </Flex>
        </Box>
    )
}
