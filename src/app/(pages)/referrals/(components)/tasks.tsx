import { colorTokens } from "@/app/components/theme/theme";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Task } from "../page";
import Image from "next/image";

interface TasksProps {
  tasks: Task[];
}

export default function Tasks({ tasks }: TasksProps) {
  //   const sorted = [...tasks].sort((a, b) => {
  //     const statusOrder =
  //       (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0);
  //     return statusOrder;
  //   });

  return (
    <>
      {tasks?.map((task) => {
        const isConnectTask = /connect/i.test(task.title);

        return (
          <Flex
            key={task.task_id}
            align="center"
            justify="space-between"
            borderRadius={27}
            bg={colorTokens.gray.tertiaryDark}
            py={3}
            px={2}
            mb={1}
            overflow="hidden"
          >
            <Flex align="center" gap={2} flex="1" minW={0}>
              {task.socialMedia === "x" && (
                <Image
                  src="/img/x-icon.webp"
                  alt="twitter"
                  width={33}
                  height={33}
                />
              )}
              {task.socialMedia === "telegram" && (
                <Image
                  src="/img/telegram-icon.webp"
                  alt="twitter"
                  width={33}
                  height={33}
                />
              )}
              {task.socialMedia === "platform" && (
                <Image
                  src="/img/logo-mobile.png"
                  alt="twitter"
                  width={33}
                  height={33}
                />
              )}

              <Box lineHeight={1} maxW="100%" flex="1" minW={0}>
                <Text
                  color="white"
                  fontSize={{ base: 16, md: "md" }}
                  truncate
                  mr={1}
                >
                  {task.title}
                </Text>
                <Text
                  color={colorTokens.gray.platinum}
                  fontSize={{ base: 13, md: "sm" }}
                >
                  +{task.points.toLocaleString()} Points
                </Text>
              </Box>
            </Flex>
            <Button
              borderRadius={19}
              px={{ base: 4, md: 6 }}
              h={{ base: 35, md: 10 }}
              fontSize={{ base: 13, md: "sm" }}
              fontWeight="semibold"
              cursor={task.status === "completed" ? "default" : "pointer"}
              disabled={task.status === "completed"}
              //   onClick={() => handleCompleteTask(task.task_id)}
              color={
                task.status === "completed"
                  ? colorTokens.gray[200]
                  : colorTokens.blackCustom.a1
              }
              bg={
                task.status === "completed"
                  ? colorTokens.gray[400]
                  : isConnectTask
                  ? "white"
                  : colorTokens.green.erin
              }
              _hover={{
                bg:
                  task.status === "completed"
                    ? colorTokens.blackCustom.a3
                    : colorTokens.green.darkErin,
              }}
              _active={{
                bg:
                  task.status === "completed"
                    ? colorTokens.blackCustom.a3
                    : colorTokens.green.dark,
              }}
              transition="background 0.2s ease"
            >
              {isConnectTask ? "Connect" : "Collect"}
            </Button>
          </Flex>
        );
      })}
    </>
  );
}
