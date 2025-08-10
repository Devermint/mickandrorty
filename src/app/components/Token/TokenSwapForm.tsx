"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  InputGroup,
  NumberInput,
} from "@chakra-ui/react";
import type { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import { WalletIcon } from "../icons/wallet";

export default function TokenSwapForm({
  agent,
  defaultAmount = 1.0,
}: {
  agent: Agent;
  defaultAmount?: number;
}) {
  const [receive, setReceive] = useState("");
  const [amt, setAmt] = useState(String(defaultAmount ?? ""));

  return (
    <Box borderRadius={16} bg={colorTokens.blackCustom.a3} maxH="50%" p={4}>
      <Flex
        justifyContent="space-between"
        fontSize={13}
        fontFamily="Sora"
        fontWeight={300}
      >
        <Text color="white">Amount to buy</Text>
        <Flex gap={1} align="center">
          <Text color="white">{amt} $APTAI</Text>
          <WalletIcon boxSize={5} color={colorTokens.green.darkErin} />
        </Flex>
      </Flex>

      <NumberInput.Root
        defaultValue={amt}
        mt={2}
        onValueChange={({ value }) => setAmt(value)}
      >
        <InputGroup
          endElement={
            <Text as="span" px={2} color="white">
              $APTAI
            </Text>
          }
        >
          <NumberInput.Input
            borderRadius={8}
            borderWidth={1}
            borderColor={colorTokens.green.dark}
            bg="rgba(18, 19, 21, 1)"
            color="white"
            inputMode="decimal"
          />
        </InputGroup>
      </NumberInput.Root>

      <Flex
        justifyContent="space-between"
        fontSize={13}
        fontFamily="Sora"
        fontWeight={300}
        mt={4}
      >
        <Text color="white">Receive</Text>
        <Text color="white">{agent.name}</Text>
      </Flex>

      <Input
        borderRadius={8}
        borderWidth={1}
        borderColor={colorTokens.green.dark}
        bg="rgba(18, 19, 21, 1)"
        mt={2}
        placeholder={"0"}
        value={receive}
        onChange={(e) => setReceive(e.target.value.replace(/[^0-9.]/g, ""))}
        inputMode="decimal"
      />

      <Flex w="100%" gap="17px" mt={4}>
        <Button
          borderRadius={8}
          bg={colorTokens.green.erin}
          flex="1"
          color="rgba(31, 125, 32, 1)"
          _hover={{ bg: colorTokens.green.erin }}
        >
          Buy
        </Button>
        <Button
          borderRadius={8}
          flex="1"
          bg="rgba(231, 55, 55, 1)"
          color="white"
          _hover={{ bg: "rgba(231, 55, 55, 1)" }}
        >
          Sell
        </Button>
      </Flex>
    </Box>
  );
}
