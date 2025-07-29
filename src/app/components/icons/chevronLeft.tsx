import { chakra, IconProps } from "@chakra-ui/react";

export function ChevronLeftIcon(props: IconProps) {
  return (
    <chakra.svg viewBox="0 0 14 25" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.9061 1.26063C13.4756 1.83015 13.4756 2.75351 12.9061 3.32303L3.72898 12.5002L12.9061 21.6773C13.4756 22.2468 13.4756 23.1702 12.9061 23.7397C12.3366 24.3092 11.4132 24.3092 10.8437 23.7397L0.635386 13.5314C0.0658711 12.9618 0.0658713 12.0385 0.635386 11.469L10.8437 1.26063C11.4132 0.691119 12.3366 0.69112 12.9061 1.26063Z"
        fill="#51FE53"
      />
    </chakra.svg>
  );
}
