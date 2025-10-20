import { PointsIcon } from "@/app/components/icons/points";
import { Box, Image as ChakraImage, Flex, Text } from "@chakra-ui/react";

interface MobileReferralsHeaderProps {
  title: string;
  points: number;
  image: string;
}

export default function MobileReferralsHeader({
  title,
  points,
  image,
}: MobileReferralsHeaderProps) {
  return (
    <Box position="relative">
      <ChakraImage src={image} w="full"></ChakraImage>
      <Flex
        position="absolute"
        bottom={0}
        px={5}
        py={4}
        w="full"
        align="end"
        justify="space-between"
      >
        <Text maxW={215} fontSize={20} color="white">
          {title}
        </Text>
        <Flex align="center" gap={2}>
          <PointsIcon w={4} h={4} />
          <Text fontSize={24} fontWeight="medium" color="white">
            {points}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
