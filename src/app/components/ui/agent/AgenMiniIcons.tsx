import { Box, Container, Flex, Image } from "@chakra-ui/react";
import NextImage from "next/image";

type AgentMiniIconProps = {
    images: string[] | undefined;
    activeIndex: number | undefined;
    onClick: (image: number) => void;
}

function ActiveEllipse() {
    return (
        <Box marginTop="0.5rem">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="4" fill="#92B624" />
            </svg>
        </Box>
    )
}

function AgentMiniIcon({ image, index, activeIndex, onClick }: { image: string, index: number, activeIndex: number | undefined, onClick: (image: number) => void }) {
    const isActive = index === activeIndex;
    const backgroundColor = isActive ? "#AFDC29" : "linear-gradient(132.4deg, rgba(84, 203, 104, 0) 14.89%, rgba(84, 185, 203, 0.1496) 73.86%), radial-gradient(77.92% 112.25% at 50% 50%, rgba(82, 101, 26, 0.67) 0%, rgba(82, 101, 26, 0) 100%)";

    return (
        <Box justifyItems="center">
            <Container borderWidth="1px" borderColor="#BDE546" borderRadius="12px" width="81px" height="60px" boxShadow="0px 0px 8.34px 0px #F9E0CC1A" background={backgroundColor} cursor="pointer" _hover={{ "transform": "scale(1.05)" }} onClick={() => onClick(index)}>
                <Image asChild draggable="false" alt="agent">
                    <NextImage src={image} alt="agent" fill={true} objectFit="contain" />
                </Image>

            </Container>
            {isActive && <ActiveEllipse />}
        </Box>
    )
}

export default function AgentMiniIcons(props: AgentMiniIconProps) {
    if (!props.images) {
        return (
            <Flex justifyContent="center" padding="1rem">
                <Box>Loading...</Box>
            </Flex>
        )
    }

    return (
        <Flex justifyContent="center" padding="1rem" gap="1rem">
            {props.images!.map((agent, index) => (
                <AgentMiniIcon key={index} image={agent} index={index} activeIndex={props.activeIndex} onClick={props.onClick} />
            ))}
        </Flex>
    )
}
