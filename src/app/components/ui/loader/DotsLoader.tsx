import { Box } from "@chakra-ui/react";

export default function DotsLoader() {
    return (
        <Box>
            <Box position="relative" width="10px" height="10px" borderRadius="5px" display="inline-block" margin="0 2px" backgroundColor="#AFDC29" animation="bounce1" />
            <Box position="relative" width="10px" height="10px" borderRadius="5px" display="inline-block" margin="0 2px" backgroundColor="#AFDC29" animation="bounce2" />
            <Box position="relative" width="10px" height="10px" borderRadius="5px" display="inline-block" margin="0 2px" backgroundColor="#AFDC29" animation="bounce3" />
        </Box>
    )
}
