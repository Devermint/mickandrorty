import { chakra, IconProps } from "@chakra-ui/react";

export default function ExternalLinkIcon(props: IconProps) {
  return (
    <chakra.svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7v2H5v14h14v-6h2zm3-8h-6V3h6v2z"
      />
    </chakra.svg>
  );
}
