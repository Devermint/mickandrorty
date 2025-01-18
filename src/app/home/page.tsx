"use client";

import { Container, Text, Flex } from '@chakra-ui/react';
import Underline from '../components/ui/Underline';
import { Agent } from '@/app/lib/agent';
import { useState, useEffect } from 'react';
import AgentCard from '../components/ui/AgentCard';

// TODO: API
const testingAgents: Agent[] = [
    {
        name: "Mick Zanches",
        bio: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        stats: {
            funny: 9,
            smart: 10,
            cynical: 9,
            compassionate: 1
        },
        image: "/agents/agent1.png"
    },
    {
        name: "Mick Zanches",
        bio: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        stats: {
            funny: 9,
            smart: 10,
            cynical: 9,
            compassionate: 1
        },
        image: "/agents/agent2.png"
    },
    {
        name: "Mick Zanches",
        bio: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        stats: {
            funny: 9,
            smart: 10,
            cynical: 9,
            compassionate: 1
        },
        image: "/agents/agent3.png"
    },
]

export default function HomePage() {
    const [agents, setAgents] = useState<Agent[]>()

    useEffect(() => {
        // TODO: API call to get agents
        setAgents(testingAgents)
    }, []);

    return (
        <div>
            <Container justifyItems="center" marginBottom="3rem">
                <Text fontSize="20px" lineHeight="26px" fontWeight="700" marginBottom="0.5rem">Select AI agent</Text>
                <Underline />
            </Container>

            <Flex wrap="wrap" gap="2.5rem">
            {agents?.map((agent, index) => (
                <AgentCard key={index} {...agent} />
            ))}
            </Flex>

        </div>
    );
}
