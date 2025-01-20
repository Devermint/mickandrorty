"use client";

import { Container, Text, Flex, Box } from '@chakra-ui/react';
import Underline from '@/app/components/ui/Underline';
import { Agent } from '@/app/lib/agent';
import { useState, useEffect } from 'react';
import AgentCardInteractive from '@/app/components/ui/agent/AgentCardInteractive';

export default function HomePage() {
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

    return (
        <div>
            <Container justifyItems="center" marginBottom="3rem">
                <Text fontSize="20px" lineHeight="26px" fontWeight="700" marginBottom="0.5rem">Select AI agent</Text>
                <Underline />
            </Container>

            <Box padding="1rem">
            <Flex gap="2.5rem" overflowY="hidden" padding="1rem">
            {agents?.map((agent, index) => (
                <AgentCardInteractive key={index} {...agent} />
            ))}
                </Flex>
            </Box>

        </div>
    );
}
