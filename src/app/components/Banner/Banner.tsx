import { Button, Flex, Text } from "@chakra-ui/react";
import { ChevronRightIcon } from "../icons/chevronRight";
import { FiChevronRight, FiChevronsRight } from "react-icons/fi";

interface Props {
  text: string;
  buttonText: string;
  image: string;
}
export const Banner = ({ text, buttonText, image }: Props) => {
  return (
    <Flex
      position="relative"
      w="full"
      px={{ base: 6, md: 6 }}
      py={18}
      borderRadius="2xl"
      color="whiteAlpha.900"
      overflow="hidden"
      backgroundImage={`url(${image})`}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundPosition="right"
    >
      <Flex
        direction="column"
        gap={{ base: 3, md: 8 }}
        maxW={{ base: "100%", md: "65%" }}
        zIndex={1}
      >
        <Text fontSize={{ base: "xl", md: 22 }} fontFamily="inter">
          {text}
        </Text>

        <Button
          variant="plain"
          bgColor="transparent"
          color="whiteAlpha.800"
          alignItems="center"
          px={0}
          border="none"
          w="max-content"
          fontFamily="inter"
        >
          {buttonText}
          <FiChevronRight />
        </Button>
      </Flex>
    </Flex>
  );
};
