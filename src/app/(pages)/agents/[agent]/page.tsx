"use client";

import { Agent } from "@/app/lib/agent";
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { useEffect, useState, use } from "react";
import AgentCard from "@/app/components/ui/agent/AgentCard";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { useRouter } from "next/navigation";
import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import { useMobileBreak } from "@/app/components/responsive";

function GridBox({ children }: { children: React.ReactNode }) {
  return (
    <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
      {children}
    </Box>
  );
}

function AgentLayoutDesktop(activeAgent: Agent) {
  return (
    <Flex paddingLeft="2rem" paddingRight="2rem" height="508px">
      <AgentCard {...activeAgent} />
      <Box marginLeft="2rem" marginRight="2rem" position="relative" alignItems="center">
        <Grid
          blur="5px"
          filter="auto"
          height="100%"
          width="100%"
          templateRows="repeat(5, 1fr)"
          templateColumns="repeat(5, 1fr)"
          gap="0.5rem"
        >
          <GridItem>
            <GridBox>
              <Box justifyItems="center" alignContent="center" height="100%">
                <Text fontWeight="400" fontSize="16px" lineHeight="24px">
                  SOCIAL GRAPH
                </Text>
              </Box>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="32px" lineHeight="41px">
                302
              </Text>
              <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">
                Score
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="32px" lineHeight="41px">
                30.32K
              </Text>
              <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">
                Followers
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={5} rowSpan={4}>
            <AgentGraph />
          </GridItem>
        </Grid>
        <Text
          position="absolute"
          right="0"
          left="0"
          marginInline="auto"
          width="fit-content"
          top="50%"
        >
          Coming soon...
        </Text>
      </Box>
      <Box width="30%">
        <AgentChat adapter={new AgentDMChatAdapter(activeAgent)} />
      </Box>
    </Flex>
  );
}

function AgentLayoutMobile(activeAgent: Agent) {
  return (
    <Flex paddingLeft="2rem" paddingRight="2rem" height="60vh" direction="column">
      <Box
        marginLeft="2rem"
        marginRight="2rem"
        position="relative"
        alignItems="center"
        height="40%"
      >
        <Grid
          blur="5px"
          filter="auto"
          height="100%"
          width="100%"
          templateRows="repeat(5, 1fr)"
          templateColumns="repeat(5, 1fr)"
          gap="0.5rem"
        >
          <GridItem>
            <GridBox>
              <Box justifyItems="center" alignContent="center" height="100%">
                <Text fontWeight="400" fontSize="14px" lineHeight="21px">
                  SOCIAL GRAPH
                </Text>
              </Box>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="17px" lineHeight="22px">
                302
              </Text>
              <Text fontWeight="500" fontSize="8px" lineHeight="11px" color="#FFFFFF">
                Score
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="17px" lineHeight="22px">
                30.32K
              </Text>
              <Text fontWeight="500" fontSize="8px" lineHeight="11px" color="#FFFFFF">
                Followers
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={5} rowSpan={4}>
            <AgentGraph />
          </GridItem>
        </Grid>
        <Text
          position="absolute"
          right="0"
          left="0"
          marginInline="auto"
          width="fit-content"
          top="50%"
        >
          Coming soon...
        </Text>
      </Box>
      <Box height="100%" marginTop="0.5rem">
        <AgentChat adapter={new AgentDMChatAdapter(activeAgent)} />
      </Box>
    </Flex>
  );
}

export default function AgentLayout({ params }: { params: Promise<{ agent: string }> }) {
  const router = useRouter();
  const args = use(params);
  const agentId = args.agent;
  const isMobile = useMobileBreak();

  const [agents, setAgents] = useState<Agent[]>();
  const [activeAgent, setActiveAgent] = useState<Agent>();

  useEffect(() => {
    fetch("/api/agents")
      .then((response) => {
        response.json().then((data) => {
          setAgents(data);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const agent = agents?.find((a) => a.id == agentId);
    setActiveAgent(agent);
  }, [agentId, agents]);

  const agentMiniIconClick = (index: number) => {
    setActiveAgent(agents![index]);
    router.push(`/agents/${agents![index].id}`);
  };

  if (activeAgent === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AgentMiniIcons
        images={agents?.map((agent) => agent.image)}
        activeIndex={agents?.findIndex((agent) => {
          return agent.id === activeAgent.id;
        })}
        onClick={agentMiniIconClick}
      />
      {isMobile ? AgentLayoutMobile(activeAgent) : AgentLayoutDesktop(activeAgent)}
    </div>
  );
}
