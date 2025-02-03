"use client";

import PlusIcon from "@/app/components/icons/plus";
import { useMobileBreak } from "@/app/components/responsive";
import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import { GroupChatAdapter, GroupChatEntry } from "@/app/lib/chat";
import { Box, Flex, VStack, Text, Image, Container } from "@chakra-ui/react";
import NextImage from "next/image";
import { useEffect, useState } from "react";

function GroupChatButton({ entry, activeChat, onClick }: { entry: GroupChatEntry, activeChat?: number, onClick: (entry: GroupChatEntry) => void }) {
    const isActive = activeChat == entry.id;

    const textColor = isActive ? "#AFDC29" : "#FFFFFF";

    const backgroundColor = isActive ? "linear-gradient(132.4deg, rgba(84, 203, 104, 0) 14.89%, rgba(84, 185, 203, 0.1496) 73.86%), radial-gradient(107.43% 154.75% at 46.56% 7.5%, rgba(82, 101, 26, 0.67) 0%, rgba(82, 101, 26, 0) 100%)" : "radial-gradient(107.43% 154.75% at 46.56% 7.5%, rgba(82, 101, 26, 0.23) 0%, rgba(82, 101, 26, 0) 100%)";
    const border = isActive ? "0.25px solid #BDE546" : "";

    return (
        <Box width="100%" background="#030B0A" borderRadius="12px" _hover={{ "transform": "scale(1.05)" }} onClick={() => onClick(entry)}>
            <Flex width="100%" alignItems="center" padding="0.5rem" background={backgroundColor} borderRadius="12px" cursor="pointer" border={border}>
                <Box background="#1D3114" width="31px" height="31px" overflow="hidden" borderWidth="1px" borderRadius="50%" borderColor="#5A7219" marginRight="1rem">
                    <Image asChild alt="agent icon">
                        <NextImage src={entry.icon} alt="agent icon" width="31" height="31" />
                    </Image>
                </Box>
                <Text fontWeight="400" fontSize="16px" lineHeight="20px" color={textColor}>
                    {entry.name}
                </Text>
            </Flex>
        </Box>
    )
}

function ChatsPageDesktop(groupChats: GroupChatEntry[], activeChat: number | undefined, selectChat: (chat: GroupChatEntry) => void) {
    return (
        <Container justifyItems="center" marginBottom="3rem" height="75vh">
            <Flex padding="2rem" height="100%" width="100%">
                <Flex direction="column" justify="space-between" width="40%">
                    <VStack marginBottom="0.5rem" gap="0.5rem">
                        {groupChats.map((groupChat, index) => (
                            <GroupChatButton key={index} entry={groupChat} activeChat={activeChat} onClick={selectChat} />
                        ))}
                    </VStack>
                    <Flex width="100%" background="#1D3114" borderRadius="12px" height="56px" justifyContent="center" alignItems="center" gap="0.5rem" padding="0.5rem" cursor="pointer">
                        {PlusIcon("#AFDC29")}
                        <Text>Create a new group</Text>
                    </Flex>
                </Flex>
                <Box width="100%" marginLeft="2rem">
                    {activeChat !== undefined ?
                        <AgentChat adapter={new GroupChatAdapter(groupChats[activeChat]!)} />
                        :
                        <Box width="100%" height="100%" background="#0C150A" borderRadius="18px">
                            <Box borderRadius="18px" height="100%" background="linear-gradient(184.07deg, rgba(84, 203, 104, 0) 50.89%, rgba(175, 220, 41, 0.09) 97.9%)" padding="1rem">
                                <Text position="relative" right="0" left="0" marginInline="auto" width="fit-content" top="50%">Select a chat to begin...</Text>
                            </Box>
                        </Box>
                    }
                </Box>
            </Flex>
        </Container>
    )
}

function ChatsPageMobile(groupChats: GroupChatEntry[], activeChat: number | undefined, selectChat: (chat: GroupChatEntry) => void) {
    const images = groupChats.map((groupChat) => { return groupChat.icon });

    const onMiniIconClick = (index: number) => {
        selectChat(groupChats[index]);
    }

    return (
        <Container justifyItems="center" marginBottom="3rem" height="70vh">
            <Flex height="100%" width="100%" direction="column">
                <AgentMiniIcons images={images} activeIndex={activeChat} onClick={onMiniIconClick} />
                <Box height="80%" marginTop="0.5rem">
                    {activeChat !== undefined ?
                        <AgentChat adapter={new GroupChatAdapter(groupChats[activeChat])} />
                        :
                        <Box width="100%" height="100%" background="#0C150A" borderRadius="18px">
                            <Box borderRadius="18px" height="100%" background="linear-gradient(184.07deg, rgba(84, 203, 104, 0) 50.89%, rgba(175, 220, 41, 0.09) 97.9%)" padding="1rem">
                                <Text position="relative" right="0" left="0" marginInline="auto" width="fit-content" top="50%">Select a chat to begin...</Text>
                            </Box>
                        </Box>
                    }
                </Box>
            </Flex>
        </Container>
    )
}

export default function ChatsPage() {
    const [groupChats, setGroupChats] = useState<GroupChatEntry[]>([]);
    const [activeChat, setActiveChat] = useState<number>();
    const isMobile = useMobileBreak();

    useEffect(() => {
        fetch("/api/chats")
            .then((res) => res.json())
            .then((data) => {
                setGroupChats(data);

                if (data.length > 0) {
                    setActiveChat(0);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const selectChat = (chat: GroupChatEntry) => {
        const index = groupChats.findIndex((groupChat) => groupChat.id == chat.id);
        setActiveChat(index);
    };

    return (
        <div>
            {
                isMobile ?
                    ChatsPageMobile(groupChats, activeChat, selectChat)
                    :
                    ChatsPageDesktop(groupChats, activeChat, selectChat)
            }
        </div>
    )
}
