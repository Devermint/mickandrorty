"use client";

import {
  Box,
  BoxProps,
  chakra,
  Code,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface Props extends BoxProps {
  children: string;
}
export const MarkdownView = ({ children, ...rest }: Props) => {
  return (
    <Box {...rest}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]} // \n → <br/>, GFM tables/lists, etc.
        components={{
          p: (props) => <chakra.p pt={2} {...props} />,
          ul: (props) => <chakra.ul pt={2} listStyleType="disc" {...props} />,
          ol: (props) => (
            <chakra.ol pt={2} listStyleType="decimal" {...props} />
          ),
          li: (props) => <chakra.li {...props} />,
          a: ({ href, ...props }) => (
            <ChakraLink href={href} color="blue.400" {...props} />
          ),
          code: ({ inline, ...props }: any) =>
            inline ? (
              <Code fontSize="sm" {...props} />
            ) : (
              <Box as="pre" overflowX="auto">
                <Code whiteSpace="pre" display="block" w="full" {...props} />
              </Box>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
};
