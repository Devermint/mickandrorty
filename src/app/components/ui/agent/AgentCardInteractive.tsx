import { Agent } from "@/app/lib/agent";
import { Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import AgentCard from "./AgentCard";

export default function AgentCardInteractive(agent: Agent) {
    const router = useRouter();

    const handleOnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/agents/${agent.id}`);
    }

    return (
        <Container cursor="pointer" _hover={{ "transform": "scale(1.05)" }} onClick={handleOnClick}>
            <AgentCard {...agent} />
        </Container>
    )
}
