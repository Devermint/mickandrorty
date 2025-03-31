import { Container, Image } from "@chakra-ui/react";
import NextImage from "next/image";
import { AgentImageProps } from "./types";

export function AgentImage({ image }: AgentImageProps) {
  return (
    <Container
      border="1px solid #282626"
      borderTopLeftRadius="80px"
      overflow="hidden"
      position="relative"
      height="231px"
      background="linear-gradient(132.4deg, rgba(84, 203, 104, 0) 14.89%, rgba(84, 185, 203, 0.1496) 73.86%)"
    >
      <Image asChild draggable="false" alt="agent photo">
        <NextImage src={image} alt="agent photo" fill={true} objectFit="contain" />
      </Image>
    </Container>
  );
}
