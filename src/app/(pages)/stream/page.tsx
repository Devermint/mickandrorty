"use client";

import { Container } from "@chakra-ui/react";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import { StreamedChatAdapter } from "@/app/lib/chat";
import { useEffect, useState } from "react";
import { Agent } from "@/app/lib/agent";

export default function StreamPage() {
    const [agent, setAgent] = useState<Agent>();

    useEffect(() => {
        // Fetch the first available agent for demo
        fetch('/api/agents')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setAgent(data[0]);
                }
            })
            .catch(error => console.error('Failed to fetch agent:', error));
    }, []);

    if (!agent) {
        return <div>Loading...</div>;
    }

    return (
        <Container justifyItems="center" marginBottom="3rem" height="75vh">
            <AgentChat adapter={new StreamedChatAdapter(agent)} />
        </Container>
    );
} 