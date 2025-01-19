import { Container, Flex, Grid, GridItem, IconButton, Image, Text } from "@chakra-ui/react";
import { Agent } from "@/app/lib/agent";
import NextImage from "next/image";

export default function AgentCard(agent: Agent) {
    const handleTelegram = (e: React.MouseEvent) => {
        // TODO: Link
        e.stopPropagation();
    }

    const handleX = (e: React.MouseEvent) => {
        // TODO: Link
        e.stopPropagation();
    }

    return (
        <Container width="360px" height="508px" background="linear-gradient(0deg, #040E0B, #040E0B), radial-gradient(446% 189.36% at 53.02% -48.52%, rgba(175, 220, 41, 0.13) 0%, rgba(0, 0, 0, 0) 100%)" borderTopLeftRadius="100px" boxShadow="0px 0px 32px 0px #F9E0CC1A" padding="1.5rem" >
            {/* Image */}
            <Container border="1px solid #282626" borderTopLeftRadius="80px" overflow="hidden" position="relative" height="231px" background="linear-gradient(132.4deg, rgba(84, 203, 104, 0) 14.89%, rgba(84, 185, 203, 0.1496) 73.86%)">
                <Image asChild draggable="false" alt="agent photo">
                    <NextImage src={agent.image} alt="agent photo" fill={true} objectFit="contain" />
                </Image>
            </Container>

            {/* Socials */}
            <Flex marginTop="0.5rem" justify="space-between">
                <Flex alignItems="center">
                    <Text fontWeight="700" fontSize="20px" lineHeight="26px" color="#AFDC29">
                        {agent.name.split(" ")[0]}
                    </Text>
                    <Text marginLeft="0.5rem" fontWeight="700" fontSize="20px" lineHeight="26px" color="#FFFFFF">
                        {agent.name.split(" ")[1]}
                    </Text>
                </Flex>
                <Flex gap="0.5rem">
                    <IconButton background="#042911" _hover={{ "background": "#0a2f17" }}>
                        <NextImage src="/socials/telegram.svg" alt="telegram" width="24" height="24" onClick={handleTelegram} />
                    </IconButton>
                    <IconButton background="#042911" _hover={{ "background": "#0a2f17" }}>
                        <NextImage src="/socials/x.svg" alt="X" width="24" height="24" onClick={handleX} />
                    </IconButton>
                </Flex>
            </Flex>

            {/* Description */}
            <Container borderWidth="1px" borderColor="#282626" borderTop="1" borderBottom="1" borderLeft="0" borderRight="0" padding="0.5rem" marginTop="0.5rem">
                <Text fontWeight="300" fontSize="14px" lineHeight="18px" color="#979797">
                    {agent.bio}
                </Text>
            </Container>

            {/* Traits */}
            <Grid gap="0" templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" marginTop="0.5rem">
                <GridItem borderWidth="1px" borderColor="#282626" borderRight="1" borderBottom="1" borderLeft="0" borderTop="0" padding="0.25rem" >
                    <Flex alignItems="center" justify="space-between">
                        <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
                            Funny
                        </Text>
                        <Text>
                            {agent.stats.funny}/10
                        </Text>
                    </Flex>
                </GridItem>

                <GridItem borderWidth="1px" borderColor="#282626" borderRight="0" borderBottom="1" borderLeft="0" borderTop="0" padding="0.25rem">
                    <Flex alignItems="center" justify="space-between">
                        <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
                            Smart
                        </Text>
                        <Text>
                            {agent.stats.smart}/10
                        </Text>
                    </Flex>
                </GridItem>

                <GridItem borderWidth="1px" borderColor="#282626" borderRight="1" borderBottom="0" borderLeft="0" borderTop="0" padding="0.25rem">
                    <Flex alignItems="center" justify="space-between">
                        <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
                            Cynical
                        </Text>
                        <Text>
                            {agent.stats.cynical}/10
                        </Text>
                    </Flex>
                </GridItem>

                <GridItem borderWidth="1px" borderColor="#282626" borderRight="0" borderBottom="0" borderLeft="0" borderTop="0" padding="0.25rem">
                    <Flex alignItems="center" justify="space-between">
                        <Text fontWeight="400" fontSize="12px" lineHeight="15px" color="#FFFFFF">
                            Compassionate
                        </Text>
                        <Text>
                            {agent.stats.compassionate}/10
                        </Text>
                    </Flex>
                </GridItem>
            </Grid>
        </Container>
    );
}
