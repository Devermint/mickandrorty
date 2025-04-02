import { Icon, IconProps } from "@chakra-ui/react";

export default function ChevronDownIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </Icon>
  );
}
