"use client";

import { Container, Text, Flex, Box, Image, Button } from '@chakra-ui/react';
import Underline from '@/app/components/ui/Underline';
import { Agent } from '@/app/lib/agent';
import { useState, useEffect } from 'react';
import AgentCardInteractive from '@/app/components/ui/agent/AgentCardInteractive';
import NextImage from 'next/image';
import AgentCard from '@/app/components/ui/agent/AgentCard';
import { useRouter } from 'next/navigation';
import { useMobileBreak } from '@/app/components/responsive';

function AgentListDesktop({ agents }: { agents: Agent[] }) {
    return (
        <Box padding="2rem" marginTop="1rem">
            <Flex overflowY="hidden" overflowX="auto" padding="1rem" justify="center" width="100%" gap="2.5rem">
                {agents.map((agent, index) => (
                    <AgentCardInteractive key={index} {...agent} />
                ))}
            </Flex>
        </Box>
    )
}

function AgentListMobile({ agents }: { agents: Agent[] }) {
    const router = useRouter();
    const [activeAgent, setActiveAgent] = useState(0)

    const agentMiniIconClick = (index: number) => {
        setActiveAgent(index);
    }

    const onContinueClick = () => {
        router.push(`/agents/${agents[activeAgent].id}`);
    }

    return (
        <div>
            <Flex justifyContent="center" marginTop="0.5rem" gap="0.5rem">
                {
                    agents.map((agent, index) => (
                        <Box key={index} onClick={() => agentMiniIconClick(index)} position="relative" width="48px" height="48px" overflow="hidden" borderWidth={index == activeAgent ? "2px" : "1px"} borderRadius="50%" borderColor={index == activeAgent ? "#AFDC29" : "#5A7219"}>
                            <Image asChild alt="agent icon">
                                <NextImage src={agent.image} alt="agent icon" fill={true} objectFit="contain" />
                            </Image>
                        </Box>
                    ))
                }
            </Flex>

            <Box padding="1rem" height="55vh">
                <AgentCard {...agents[activeAgent]} />
            </Box>

            <Flex justifyContent="center">
                <Button background="#AFDC29" borderColor="#5C7B1D" borderWidth="1px" color="#1D3114" onClick={onContinueClick}>
                    Continue
                </Button>
            </Flex>
        </div>
    )
}

export default function HomePage() {
    const isMobile = useMobileBreak();
    const [agents, setAgents] = useState<Agent[]>()

    useEffect(() => {
        fetch('/api/agents').then((response) => {
            response.json().then((data) => {
                setAgents(data)
            })
        }).catch((error) => {
            console.error(error)
        });
    }, []);

    if (agents === undefined) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Container justifyItems="center">
                <Text fontSize="20px" lineHeight="26px" fontWeight="700" marginBottom="0.5rem">Select AI agent</Text>
                <Underline />
            </Container>

            {
                isMobile ?
                    <AgentListMobile agents={agents} />
                    :
                    <AgentListDesktop agents={agents} />
            }
        </div>
    );
}
