"use client";

import {
  Box,
  BoxProps,
  chakra,
  Code,
  Link as ChakraLink,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { colorTokens } from "../theme/theme";

interface Props extends BoxProps {
  children: string;
  isMyMessage?: boolean;
}
export const MarkdownView = ({
  children,
  isMyMessage = false,
  ...rest
}: Props) => {
  return (
    <Box {...rest}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: (props) => <chakra.p pt={isMyMessage ? 0 : 2} {...props} />,
          ul: (props) => <chakra.ul pt={2} listStyleType="disc" {...props} />,
          ol: (props) => (
            <chakra.ol pt={2} listStyleType="decimal" {...props} />
          ),
          li: (props) => <chakra.li {...props} />,
          a: ({ href, ...props }) => (
            <ChakraLink href={href} color="blue.400" {...props} />
          ),
          code: ({ inline, ...props }: any) => (
            <Code
              whiteSpace="pre"
              display="block"
              w="100%"
              textWrap="pretty"
              bg="transparent"
              color={colorTokens.gray.platinum}
              p={0}
              {...props}
            />
          ),
          img: (props) => {
            const blobMatch = children.match(/!\[.*?\]\((blob:[^)]+)\)/);
            if (blobMatch) {
              return (
                <img
                  src={blobMatch[1]}
                  alt={props.alt || "Image"}
                  style={{ maxWidth: "100%" }}
                />
              );
            }

            return <img {...props} style={{ maxWidth: "100%" }} />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
};
