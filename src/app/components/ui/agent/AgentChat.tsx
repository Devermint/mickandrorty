"use client";

import { ChatAdapter, ChatEntry } from "@/app/lib/chat";
import { Box, Flex, Image, Input, Spinner, Text } from "@chakra-ui/react";
import NextImage from "next/image";
import React, { useState, useEffect } from "react";
import ArrowIcon from "../../icons/arrow";

function AgentMessage({ adapter, entry }: { adapter: ChatAdapter, entry: ChatEntry }) {
    return (
        <Flex gap="1rem" overflowX="hidden" justifyContent="flex-start">
            <Box background="#1D3114" width="31px" height="31px" overflow="hidden" borderWidth="1px" borderRadius="50%" borderColor="#5A7219" >
                <Image asChild alt="agent icon">
                    <NextImage src={adapter.getImage()} alt="agent icon" width="31" height="31" />
                </Image>
            </Box>
            <Box borderRadius="11px" opacity="30%" width="80%" background="#1D3114" padding="0.5rem">
                <Text fontWeight="400" fontSize="14px" lineHeight="21px">{entry.message}</Text>
            </Box>
        </Flex>
    )
}

function PersonMessage({ entry }: { entry: ChatEntry }) {
    return (
        <Flex justify="flex-end" gap="0.25rem" overflowX="hidden" direction="column" alignItems="flex-end">
            <Box>
                <Text fontWeight="400" fontSize="12px" lineHeight="18px">
                    You
                </Text>
            </Box>
            <Box borderRadius="11px" opacity="30%" width="90%" background="#AFDC29" padding="0.5rem">
                <Text fontWeight="400" fontSize="14px" lineHeight="21px" color="#040E0B">{entry.message}</Text>
            </Box>
        </Flex>
    )
}

function ChatMessage({ adapter, entry }: { adapter: ChatAdapter, entry: ChatEntry }) {
    return (
        <div>
            {entry.alignment === "right" ? <PersonMessage entry={entry} /> : <AgentMessage adapter={adapter} entry={entry} />}
        </div>
    )
}

function ResponseWaiter() {
    return (
       <Spinner />
    )
}

export default function AgentChat({ adapter }: { adapter: ChatAdapter }) {
    const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);

    const inputMessage = React.useRef<HTMLInputElement>(null);
    const bottomScroll = React.useRef<HTMLDivElement>(null);
    const [processingMessage, setProcessingMessage] = React.useState(false);

    useEffect(() => {
        const entries = adapter.getChatEntries();
        entries.then((data) => setChatEntries(data));
    }, [adapter]);

    const sendMessage = () => {
        if (processingMessage) {
            return;
        }

        if (inputMessage.current === null) {
            return;
        }

        const message = inputMessage.current.value;

        if (message === "") {
            return;
        }

        inputMessage.current.value = "";

        // TODO: API call to send message

        setChatEntries([
            ...chatEntries,
            {
                sender: "You",
                message: message,
                alignment: "right",
            },
        ]);
        setProcessingMessage(true);
    };

    const reactToEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // TODO: Handle shift+enter and enter
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    useEffect(() => {
        bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatEntries]);

    return (
        <Box width="100%" height="100%" background="#0C150A" borderRadius="18px">
            <Box borderRadius="18px" height="100%" background="linear-gradient(184.07deg, rgba(84, 203, 104, 0) 50.89%, rgba(175, 220, 41, 0.09) 97.9%)" padding="1rem">
                <Flex direction="column" gap="1rem" justify="space-between" height="100%">
                    <Flex direction="column" height="90%" overflowY="auto" gap="0.75rem" padding="0.25rem">
                        {chatEntries && chatEntries.map((entry, index) => (
                            <ChatMessage key={index} adapter={adapter} entry={entry} />
                        ))}
                        {processingMessage && <ResponseWaiter />}
                        <div ref={bottomScroll}></div>
                    </Flex>
                    <Box borderRadius="13px" background="#1D3114" padding="0.5rem">
                        <Flex justify="space-between">
                            <Input disabled={processingMessage} borderWidth="0px" color="#52651A" css={{ "--focus-color": "transparent", "--focus-ring-color": "transparent" }} placeholder={`Message ${adapter.getName().split(' ')[0]}`} ref={inputMessage} onKeyDown={(e) => reactToEnterKey(e)} />
                            <Box cursor={processingMessage ? "disabled" : "pointer"} onClick={sendMessage} justifyItems="center" alignContent="center">
                                {ArrowIcon("#AFDC29")}
                            </Box>
                        </Flex>
                    </Box>
                </Flex>
            </Box>
        </Box>
    )
}
