"use client";

import { Box, BoxProps } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

interface Props extends BoxProps {
  children: string;
}
export const MarkdownView = ({ children, ...rest }: Props) => {
  return (
    <Box {...rest}>
      <ReactMarkdown skipHtml>{children}</ReactMarkdown>
    </Box>
  );
};
