import { chakra, IconProps } from "@chakra-ui/react";

export function ChevronRightIcon(props: IconProps) {
  return (
    <chakra.svg viewBox="0 0 14 25" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.09364 1.26063C0.524125 1.83015 0.524125 2.75351 1.09364 3.32303L10.2708 12.5002L1.09364 21.6773C0.524128 22.2468 0.524128 23.1702 1.09364 23.7397C1.66316 24.3092 2.58652 24.3092 3.15604 23.7397L13.3644 13.5314C13.9339 12.9618 13.9339 12.0385 13.3644 11.469L3.15603 1.26063C2.58652 0.691119 1.66315 0.69112 1.09364 1.26063Z"
        fill="#51FE53"
      />
    </chakra.svg>
  );
}
