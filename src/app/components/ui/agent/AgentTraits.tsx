import { Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { AgentTraitsProps } from "./types";

export function AgentTraits({ stats }: AgentTraitsProps) {
  return (
    <Grid gap="0" templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" marginTop="0.5rem">
      <GridItem
        borderWidth="1px"
        borderColor="#282626"
        borderRight="1"
        borderBottom="1"
        borderLeft="0"
        borderTop="0"
        padding="0.25rem"
      >
        <Flex alignItems="center" justify="space-between">
          <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
            Funny
          </Text>
          <Text>{stats.funny}/10</Text>
        </Flex>
      </GridItem>

      <GridItem
        borderWidth="1px"
        borderColor="#282626"
        borderRight="0"
        borderBottom="1"
        borderLeft="0"
        borderTop="0"
        padding="0.25rem"
      >
        <Flex alignItems="center" justify="space-between">
          <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
            Smart
          </Text>
          <Text>{stats.smart}/10</Text>
        </Flex>
      </GridItem>

      <GridItem
        borderWidth="1px"
        borderColor="#282626"
        borderRight="1"
        borderBottom="0"
        borderLeft="0"
        borderTop="0"
        padding="0.25rem"
      >
        <Flex alignItems="center" justify="space-between">
          <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
            Cynical
          </Text>
          <Text>{stats.cynical}/10</Text>
        </Flex>
      </GridItem>

      <GridItem
        borderWidth="1px"
        borderColor="#282626"
        borderRight="0"
        borderBottom="0"
        borderLeft="0"
        borderTop="0"
        padding="0.25rem"
      >
        <Flex alignItems="center" justify="space-between">
          <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
            Compassionate
          </Text>
          <Text>{stats.compassionate}/10</Text>
        </Flex>
      </GridItem>
    </Grid>
  );
}
