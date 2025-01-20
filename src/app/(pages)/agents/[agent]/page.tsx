"use client";

import { Agent } from "@/app/lib/agent";
import { Box, Container, Flex, Grid, GridItem, Image, Text } from "@chakra-ui/react"
import { useEffect, useState, use } from "react"
import NextImage from "next/image"
import AgentCard from "@/app/components/ui/agent/AgentCard";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { useRouter } from "next/navigation";

function ActiveEllipse() {
    return (
        <Box marginTop="0.5rem">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="4" fill="#92B624" />
            </svg>
        </Box>
    )
}

function AgentMiniIcon({ agent, activeAgent, onClick }: { agent: Agent, activeAgent: string, onClick: (agent: Agent) => void }) {
    const isActive = agent.id == activeAgent;
    const backgroundColor = isActive ? "#AFDC29" : "linear-gradient(132.4deg, rgba(84, 203, 104, 0) 14.89%, rgba(84, 185, 203, 0.1496) 73.86%), radial-gradient(77.92% 112.25% at 50% 50%, rgba(82, 101, 26, 0.67) 0%, rgba(82, 101, 26, 0) 100%)";

    return (
        <Box justifyItems="center">
            <Container borderWidth="1px" borderColor="#BDE546" borderRadius="12px" width="81px" height="60px" boxShadow="0px 0px 8.34px 0px #F9E0CC1A" background={backgroundColor} cursor="pointer" _hover={{ "transform": "scale(1.05)" }} onClick={() => onClick(agent)}>
                <Image asChild draggable="false" alt="agent">
                    <NextImage src={agent.image} alt="agent" fill={true} objectFit="contain" />
                </Image>

            </Container>
            {isActive && <ActiveEllipse />}
        </Box>
    )
}

function GridBox({ children }: { children: React.ReactNode }) {
    return (
        <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
            {children}
        </Box>
    )
}

export default function AgentLayout({
    params,
}: {
    params: Promise<{ agent: string }>
    }) {
    const router = useRouter();
    const args = use(params);
    const agentId = args.agent;

    const [agents, setAgents] = useState<Agent[]>()
    const [activeAgent, setActiveAgent] = useState<Agent>()

    useEffect(() => {
        fetch('/api/agents').then((response) => {
            console.log(response);
            response.json().then((data) => {
                setAgents(data);
            })
        }).catch((error) => {
            console.error(error)
        });
    }, []);

    useEffect(() => {
        const agent = agents?.find((a) => a.id == agentId);
        setActiveAgent(agent);
    }, [agentId, agents]);

    const agentMiniIconClick = (agent: Agent) => {
        setActiveAgent(agent);
        router.push(`/agents/${agent.id}`);
    }

    return (
        <div>
            <Flex justifyContent="center" padding="1rem" gap="1rem">
                {agents?.map((agent, index) => (
                    <AgentMiniIcon key={index} agent={agent} activeAgent={agentId} onClick={agentMiniIconClick} />
                ))}
            </Flex>
            {activeAgent &&
                <Flex paddingLeft="2rem" paddingRight="2rem" height="508px">
                    <AgentCard {...activeAgent} />
                    <Box marginLeft="2rem" marginRight="2rem" position="relative" alignItems="center">
                        <Grid blur="5px" filter="auto" height="100%" width="100%" templateRows="repeat(5, 1fr)" templateColumns="repeat(5, 1fr)" gap="0.5rem">
                            <GridItem>
                                <GridBox>
                                    <Box justifyItems="center" alignContent="center" height="100%">
                                        <Text fontWeight="400" fontSize="16px" lineHeight="24px">SOCIAL GRAPH</Text>
                                    </Box>
                                </GridBox>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <GridBox>
                                    <Text fontWeight="700" fontSize="32px" lineHeight="41px">302</Text>
                                    <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">Score</Text>
                                </GridBox>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <GridBox>
                                    <Text fontWeight="700" fontSize="32px" lineHeight="41px">30.32K</Text>
                                    <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">Followers</Text>
                                </GridBox>
                            </GridItem>
                            <GridItem colSpan={5} rowSpan={4}>
                                <AgentGraph />
                            </GridItem>
                        </Grid>
                        <Text position="absolute" right="0" left="0" marginInline="auto" width="fit-content" top="50%" >Coming soon...</Text>
                    </Box>
                    <Box width="320px">
                        <AgentChat adapter={new AgentDMChatAdapter(activeAgent)} />
                    </Box>
                </Flex>
            }
        </div>
    )
}
