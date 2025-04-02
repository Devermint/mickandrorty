"use client";

import { AboutAptosConnectEducationScreen } from "@aptos-labs/wallet-adapter-react";
import { Box, Button, IconButton, Stack, Text, Grid } from "@chakra-ui/react";
import ArrowIcon from "@/app/components/icons/arrow";

export default function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <>
      <Grid templateColumns="1fr 4fr 1fr" alignItems="center" justifyItems="start">
        <IconButton
          onClick={screen.cancel}
          aria-label="Back"
          variant="ghost"
          transform="rotate(180deg)"
        >
          <ArrowIcon strokeColor="currentColor" />
        </IconButton>
        <Text as="h2" width="100%" textAlign="center" fontSize="md">
          About Aptos Connect
        </Text>
      </Grid>

      <Box display="flex" pb={6} alignItems="flex-end" justifyContent="center" height="162px">
        <screen.Graphic />
      </Box>
      <Stack gap={1} textAlign="center" pb={4}>
        <Box as={screen.Title} fontSize="xl" fontWeight="semibold" />
        <Box
          as={screen.Description}
          fontSize="sm"
          color="gray.600"
          css={{
            "&>a": {
              color: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            },
          }}
        />
      </Stack>

      <Grid templateColumns="repeat(3, 1fr)" alignItems="center">
        <Button size="sm" variant="ghost" onClick={screen.back} justifySelf="start">
          Back
        </Button>
        <Box display="flex" alignItems="center" gap={1} justifySelf="center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <Box
              key={i}
              as={ScreenIndicator}
              px={0}
              py={2}
              bg="none"
              border="none"
              cursor="pointer"
            >
              <Box height="2px" width="24px" bg="gray.400" _groupActive={{ bg: "gray.900" }} />
            </Box>
          ))}
        </Box>
        <Button size="sm" variant="ghost" onClick={screen.next} justifySelf="end">
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
          <Box as="span" ml={2}>
            <ArrowIcon strokeColor="currentColor" />
          </Box>
        </Button>
      </Grid>
    </>
  );
}
