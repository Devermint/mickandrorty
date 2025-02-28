"use client";

// import Message from "@/app/components/ui/chats/Message";
// import Tweet from "@/app/components/ui/chats/Tweet";
// import { Box, Text, VStack, Container, HStack } from "@chakra-ui/react";
// import { useRef, useEffect, useState } from "react";
// import { Agent } from "@/app/lib/agent";
// import { ChatEntry } from "@/app/lib/chat";

// export default function CommunityPage() {
//   const [showTopShadowLeft, setShowTopShadowLeft] = useState(false);
//   const [showBottomShadowLeft, setShowBottomShadowLeft] = useState(true);
//   const [showTopShadowRight, setShowTopShadowRight] = useState(false);
//   const [showBottomShadowRight, setShowBottomShadowRight] = useState(true);

//   // States for streaming and agent interaction
//   const [tweetMessages, setTweetMessages] = useState<string[]>([]);
//   const [chatMessages, setChatMessages] = useState<ChatEntry[]>([]);
//   const [agent, setAgent] = useState<Agent>();
//   // const [eventSource, setEventSource] = useState<EventSource | null>(null);
//   const [messageQueue, setMessageQueue] = useState<string[]>([]);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const leftScrollRef = useRef<HTMLDivElement>(null);
//   const rightScrollRef = useRef<HTMLDivElement>(null);
//   // const userId = useRef(generateId(12));
//   // const roomId = useRef(generateId(12));

//   // Helper function to generate random IDs
//   // function generateId(size: number) {
//   //   return [...Array(size)].map(() => Math.floor(Math.random() * 36).toString(36)).join("");
//   // }

//   const handleScroll = (
//     element: HTMLDivElement | null,
//     setTopShadow: (show: boolean) => void,
//     setBottomShadow: (show: boolean) => void
//   ) => {
//     if (!element) return;

//     const isAtTop = element.scrollTop === 0;
//     const isAtBottom =
//       Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;

//     setTopShadow(!isAtTop);
//     setBottomShadow(!isAtBottom);
//   };

//   // Fetch agent
//   useEffect(() => {
//     fetch("/api/agents")
//       .then((res) => res.json())
//       .then((data) => {
//         if (data && data.length > 0) {
//           setAgent(data[0]);
//         }
//       })
//       .catch((error) => console.error("Failed to fetch agent:", error));
//   }, []);

//   // Connect to message stream
//   useEffect(() => {
//     if (!agent) return;

//     const source = new EventSource("http://localhost:2800/messages/stream");
//     // setEventSource(source);

//     source.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       // Add to tweet messages immediately
//       setTweetMessages((prev) => [...prev, data.content]);

//       // Add to message queue for agent processing
//       setMessageQueue((prev) => [...prev, data.content]);

//       // Auto-scroll tweets
//       if (leftScrollRef.current) {
//         setTimeout(() => {
//           if (leftScrollRef.current) {
//             leftScrollRef.current.scrollTop = leftScrollRef.current.scrollHeight;
//           }
//         }, 100);
//       }
//     };

//     source.onerror = (error) => {
//       console.error("EventSource failed:", error);
//       source.close();
//       // setEventSource(null);
//       // Attempt to reconnect after 5 seconds
//       setTimeout(() => {
//         // const newSource = new EventSource("http://localhost:2800/messages/stream");
//         // setEventSource(newSource);
//       }, 5000);
//     };

//     return () => {
//       source.close();
//       // setEventSource(null);
//     };
//   }, [agent]);

//   // Process message queue
//   useEffect(() => {
//     if (isProcessing || messageQueue.length === 0 || !agent) return;

//     const processNextMessage = async () => {
//       setIsProcessing(true);
//       // const message = messageQueue[0];
//       setMessageQueue((prev) => prev.slice(1));

//       try {
//         // Send message to agent
//         // const response = await fetch(`/api/chats/text`, {
//         //   method: "POST",
//         //   body: JSON.stringify({
//         //     agent: agent.id,
//         //     message: message,
//         //     userId: userId.current,
//         //     roomId: roomId.current,
//         //   }),
//         // });

//         // Get updated chat entries
//         const chatEntries = await fetch(`/api/chats/${agent.id}`)
//           .then((res) => res.json())
//           .then((data) => data as ChatEntry[]);

//         setChatMessages(chatEntries);

//         // Auto-scroll chat
//         if (rightScrollRef.current) {
//           setTimeout(() => {
//             if (rightScrollRef.current) {
//               rightScrollRef.current.scrollTop = rightScrollRef.current.scrollHeight;
//             }
//           }, 100);
//         }
//       } catch (error) {
//         console.error("Failed to process message:", error);
//       } finally {
//         setIsProcessing(false);
//       }
//     };

//     processNextMessage();
//   }, [messageQueue, isProcessing, agent]);

//   // Set up scroll event listeners
//   useEffect(() => {
//     const leftElement = leftScrollRef.current;
//     const rightElement = rightScrollRef.current;

//     const handleLeftScroll = () =>
//       handleScroll(leftElement, setShowTopShadowLeft, setShowBottomShadowLeft);
//     const handleRightScroll = () =>
//       handleScroll(rightElement, setShowTopShadowRight, setShowBottomShadowRight);

//     leftElement?.addEventListener("scroll", handleLeftScroll);
//     rightElement?.addEventListener("scroll", handleRightScroll);

//     return () => {
//       leftElement?.removeEventListener("scroll", handleLeftScroll);
//       rightElement?.removeEventListener("scroll", handleRightScroll);
//     };
//   }, []);

//   return (
//     <Container maxW="container.xl" h="100vh" py={8}>
//       <VStack gap={8} align="center" h="full">
//         <Text
//           fontSize={{ base: "4xl", md: "6xl" }}
//           fontWeight="bold"
//           color="#A4D03F"
//           textAlign="center"
//           fontFamily="JetBrains Mono"
//           textShadow="0 0 10px rgba(164, 208, 63, 0.5)"
//         >
//           JOIN THE COMMUNITY
//         </Text>

//         <Text
//           fontSize={{ base: "2xl", md: "4xl" }}
//           color="#A4D03F"
//           textAlign="center"
//           fontFamily="JetBrains Mono"
//           opacity={0.8}
//         >
//           45 000 active users
//         </Text>

//         <HStack w="full" h="45dvh" gap={4} align="stretch">
//           <Box
//             position="relative"
//             border="1px solid #11331D"
//             w="50%"
//             background="#0C150A"
//             backdropFilter="blur(11.8px)"
//             h="full"
//             borderRadius="xl"
//             overflow="hidden"
//           >
//             {showTopShadowLeft && (
//               <Box
//                 position="absolute"
//                 top={0}
//                 left={0}
//                 right={0}
//                 h="40px"
//                 bg="linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)"
//                 zIndex={2}
//               />
//             )}
//             <Box ref={leftScrollRef} overflowY="auto" h="full" px={4} py={2}>
//               <VStack gap={4}>
//                 {tweetMessages.map((text, i) => (
//                   <Tweet key={i} text={text} />
//                 ))}
//               </VStack>
//             </Box>
//             {showBottomShadowLeft && (
//               <Box
//                 position="absolute"
//                 bottom={0}
//                 left={0}
//                 right={0}
//                 h="40px"
//                 bg="linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)"
//                 zIndex={2}
//               />
//             )}
//           </Box>

//           <Box
//             position="relative"
//             border="1px solid #11331D"
//             background="#0C150A"
//             backdropFilter="blur(11.8px)"
//             w="50%"
//             h="full"
//             borderRadius="xl"
//             overflow="hidden"
//           >
//             {showTopShadowRight && (
//               <Box
//                 position="absolute"
//                 top={0}
//                 left={0}
//                 right={0}
//                 h="40px"
//                 bg="linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)"
//                 zIndex={2}
//               />
//             )}
//             <Box ref={rightScrollRef} overflowY="auto" h="full" px={4} py={2}>
//               <VStack gap={3}>
//                 {chatMessages.map((entry, i) => (
//                   <Message key={i} text={entry.message} isAgent={entry.alignment === "left"} />
//                 ))}
//               </VStack>
//             </Box>
//             {showBottomShadowRight && (
//               <Box
//                 position="absolute"
//                 bottom={0}
//                 left={0}
//                 right={0}
//                 h="40px"
//                 bg="linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)"
//                 zIndex={2}
//               />
//             )}
//           </Box>
//         </HStack>
//       </VStack>
//     </Container>
//   );
// }
import { Text } from "@chakra-ui/react";

export default function CommunityPage() {
  return (
    <Text position="absolute" right="0" left="0" marginInline="auto" width="fit-content" top="50%">
      Coming soon...
    </Text>
  );
}
