import { Flex, Text } from "@chakra-ui/react";

export type ChatEntryProps = {
  sender: string;
  message: string;
  alignment: "left" | "right";
};

export const ChatEntry = (props: ChatEntryProps) => {
  return (
    <Flex
      direction="column"
      alignItems={props.alignment === "left" ? "flex-start" : "flex-end"}
      mb="10px"
    >
      <Text borderColor="green.400" alignContent="center">
        {props.sender}
      </Text>
      <Text borderColor="white" ml="0.5rem" mr="0.5rem">
        {props.message}
      </Text>
    </Flex>
  );
};

export const DefaultChatEntry = () => {
  return (
    <ChatEntry
      sender=""
      message="Here you will see your conversation with the agent... Go ahead try asking it something"
      alignment="left"
    />
  );
};
