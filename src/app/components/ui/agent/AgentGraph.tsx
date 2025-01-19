import { Container, Image } from "@chakra-ui/react";
import NextImage from "next/image";

export default function AgentGraph() {
    // TODO: Actual graph
    return (
        <Container height="100%" width="100%">
            <Image asChild userSelect="none" draggable="false">
                <NextImage src="/agents/graph.svg" alt="graph" fill={true} objectFit="contain" />
            </Image>
        </Container>
    )
}
