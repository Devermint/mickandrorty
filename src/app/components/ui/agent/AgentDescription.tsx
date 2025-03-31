import { Container, Text } from "@chakra-ui/react";

interface AgentDescriptionProps {
  bio: string;
}

export function AgentDescription({ bio }: AgentDescriptionProps) {
  return (
    <Container
      borderWidth="1px"
      borderColor="#282626"
      borderTop="1"
      borderBottom="1"
      borderLeft="0"
      borderRight="0"
      padding="0.5rem"
      marginTop="0.5rem"
    >
      <Text fontWeight="300" fontSize="14px" lineHeight="18px" color="#979797">
        {bio}
      </Text>
    </Container>
  );
}
