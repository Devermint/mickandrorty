import { Box, Button, Flex } from '@chakra-ui/react';
import Image from 'next/image';

export default function TopBar() {
    return (
        <Flex alignItems="center" justifyContent="space-between">
            <Box mt="1rem" ml="2rem">
                <Image src="/logo.png" alt="logo" width={200} height={60} />
            </Box>
            <Button mr="2rem" background="#1D3114">
                Connect wallet
            </Button>
        </Flex>
    )
}
