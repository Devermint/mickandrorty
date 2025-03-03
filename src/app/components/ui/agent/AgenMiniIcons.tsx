import { Box, Flex, Image } from "@chakra-ui/react";
import NextImage from "next/image";

type AgentMiniIconProps = {
  images: string[] | undefined;
  activeIndex: number | undefined;
  onClick: (image: number) => void;
};

function AgentMiniIcon({
  image,
  index,
  activeIndex,
  onClick,
}: {
  image: string;
  index: number;
  activeIndex: number | undefined;
  onClick: (image: number) => void;
}) {
  const isActive = index === activeIndex;

  return (
    <Flex alignItems="center" flexDirection="column" gap="0.5rem">
      <Box
        position="relative"
        minWidth="80px"
        height="60px"
        overflow="hidden"
        borderWidth={isActive ? "2px" : "1px"}
        borderRadius="12px"
        borderColor={isActive ? "#AFDC29" : "#5A7219"}
        background={
          isActive
            ? "radial-gradient(circle at center, #A4F05C 0%, #56933B 100%)"
            : "radial-gradient(circle at center, rgba(90, 114, 25, 0.3) 0%, rgba(29, 49, 20, 0.6) 80%)"
        }
        _hover={{
          borderColor: "#BDE546",
        }}
        cursor="pointer"
        onClick={() => onClick(index)}
      >
        <Image asChild alt="agent" draggable="false">
          <NextImage
            src={image}
            alt="agent"
            fill={true}
            objectFit="contain"
            style={{
              opacity: isActive ? 1 : 0.3,
            }}
          />
        </Image>
      </Box>
      {isActive ? <Box w="8px" h="8px" borderRadius="full" background="#92B624" /> : null}
    </Flex>
  );
}

export default function AgentMiniIcons(props: AgentMiniIconProps) {
  if (!props.images) {
    return (
      <Flex justifyContent="center" padding="1rem">
        <Box>Loading...</Box>
      </Flex>
    );
  }

  return (
    <Flex justifyContent="center" padding="0.5rem" gap="1rem">
      {props.images!.map((agent, index) => (
        <AgentMiniIcon
          key={index}
          image={agent}
          index={index}
          activeIndex={props.activeIndex}
          onClick={props.onClick}
        />
      ))}
    </Flex>
  );
}
