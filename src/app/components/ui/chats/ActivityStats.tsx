"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { db } from "@/app/lib/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

export default function ActivityStats() {
  const [snapshot] = useDocument(doc(db, "stats", "stats"));

  const onlineUsers = snapshot?.data()?.totalGroupChatOnlineUserCount || 0;
  const totalUsers = snapshot?.data()?.totalGroupChatUserCount || 0;

  return (
    <Box background="#0C150A" borderRadius="18px" marginTop="48px" py={4} px={5} width="300px">
      <VStack align="flex-start" gap="1rem">
        <Box>
          <Text as="span" color="#B1B3B9">
            Online users:{" "}
          </Text>
          <Text as="span" color="#AFDC29" fontWeight="500">
            {onlineUsers.toLocaleString()}
          </Text>
        </Box>
        <Box>
          <Text as="span" color="#B1B3B9">
            Total users:{" "}
          </Text>
          <Text as="span" color="#AFDC29" fontWeight="500">
            {totalUsers.toLocaleString()}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
