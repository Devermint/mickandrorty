"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
// import { useEffect, useRef, useState } from "react";
// import { ChatEntryProps, DefaultChatEntry, ChatEntry } from "./ChatEntry";
import { AgentInput } from "../Agent/AgentInput";

// type Props = {
//   agentName: string;
//   agentHost: string;
// };

// const generateId = (size: number) =>
//   [...Array(size)]
//     .map(() => Math.floor(Math.random() * 36).toString(36))
//     .join("");

const Chat = () => {
  //   const inputMessage = useRef<HTMLInputElement>(null);
  //   const bottomScroll = useRef<HTMLDivElement>(null);

  //   const [processing, setProcessing] = useState(false);

  //   const [messages, setMessages] = useState<ChatEntryProps[]>([]);

  //   useEffect(() => {
  //     bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  //   const onMessageSend = () => {
  //     if (processing) {
  //       return;
  //     }

  //     if (inputMessage.current === null || inputMessage.current.value === "") {
  //       return;
  //     }

  //     const message = inputMessage.current.value;
  //     inputMessage.current.value = "";
  //     inputMessage.current.blur();

  //     setProcessing(true);

  //     setMessages([
  //       ...messages,
  //       {
  //         sender: "You",
  //         message: message,
  //         alignment: "right",
  //       },
  //     ]);
  //   };

  // fetch("/api/chats/" + props.agentName, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     agentHost: props.agentHost,
  //     payload: {
  //       text: message,
  //       userId: userId,
  //       roomId: roomId,
  //       userName: userId,
  //     },
  //   }),
  // })
  //   .then((response) => {
  //     if (response.status !== 200) {
  //       throw new Error("Failed to send message");
  //     }
  //     return response.json();
  //   })
  //   .then((data) => {
  //     setMessages([
  //       ...messages,
  //       {
  //         sender: "You",
  //         message: message,
  //         alignment: "right",
  //       },
  //       {
  //         sender: props.agentName,
  //         message: data.text,
  //         alignment: "left",
  //       },
  //     ]);
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   })
  //   .finally(() => {
  //     setProcessing(false);
  //   });

  //   const onInputKeyDown = (e: React.KeyboardEvent) => {
  //     if (e.key === "Enter") {
  //       e.preventDefault();
  //       onMessageSend();
  //     }
  //   };
  return (
    <Box
      bg="gray.900"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.700"
      h="400px"
      display="flex"
      pb={{ base: 0, md: 6 }}
      flexDirection="column"
    >
      <Text borderColor="green.400" p={4} fontSize="lg">
        Chat
      </Text>

      <Flex
        direction="column"
        overflowY="auto"
        p={4}
        height="10dvh"
        mr="0.5rem"
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "white",
            borderRadius: "24px",
          },
        }}
      >
        {/* {messages.length === 0 && <DefaultChatEntry />}
        {messages.map((message, index) => (
          <ChatEntry
            key={index}
            sender={message.sender}
            message={message.message}
            alignment={message.alignment}
          />
        ))}

        <div ref={bottomScroll} /> */}
      </Flex>

      {/* <Flex p={2} gap={2}>
        <Input
          flex={1}
          color="white"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          placeholder={processing ? "Processing..." : "Type something"}
          _placeholder={{ color: "gray.500" }}
          ref={inputMessage}
          onKeyDown={onInputKeyDown}
        />
        <Button
          variant="primary"
          px={8}
          disabled={processing}
          onClick={onMessageSend}
        >
          Send
        </Button>
      </Flex> */}
      <AgentInput />
    </Box>
  );
};

export default Chat;
