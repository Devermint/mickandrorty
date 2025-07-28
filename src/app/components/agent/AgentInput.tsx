import { Button, Flex, Textarea } from "@chakra-ui/react";
import { colorTokens } from "../theme";
import AnimatedBorderBox from "../ui/AnimatedBorderBox/AnimatedBorderBox";
import { ArrowUp } from "../icons/arrowUp";

export const AgentInput = () => {
  return (
    <AnimatedBorderBox
      mt={100}
      color="rgba(0, 255, 109, 1)"
      borderColor="rgba(42, 189, 105, 0.6)"
      borderWidth={1}
      p={0}
      borderRadius={13}
      w="100%"
      h={100}
      bgColor={colorTokens.blackCustom.a1}
    >
      <Flex h="100%" p={3} align="flex-end">
        <Textarea
          h="100%"
          fontFamily="Sora"
          placeholder="Start generating..."
          color={colorTokens.gray.timberwolf}
          transition="box-shadow 0.3s ease"
          border="none"
          borderRadius={13}
          _focus={{
            outline: "none",
            boxShadow: "none",
          }}
          resize="none"
        ></Textarea>

        <Button borderRadius={22} maxH={35} maxW={35} p={0} border="none">
          <ArrowUp h="full" w="full" />
        </Button>
      </Flex>
    </AnimatedBorderBox>
  );
};
