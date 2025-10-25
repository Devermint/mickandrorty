import { chakra, IconProps } from "@chakra-ui/react";

export function HamburgerIcon(props: IconProps) {
  return (
    <chakra.svg
      width="26"
      height="20"
      viewBox="0 0 26 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.07812 3.77881H5.93498C6.50685 3.77881 7.0553 3.55163 7.45968 3.14726L8.89718 1.70976C9.73924 0.867689 11.1045 0.86769 11.9466 1.70976L13.3841 3.14726C13.7885 3.55163 14.3369 3.77881 14.9088 3.77881H24.0781"
        stroke="currentColor"
        strokeWidth="2.15625"
        strokeLinecap="round"
      />
      <path
        d="M24.0781 18.8726H19.2213C18.6494 18.8726 18.1009 18.6454 17.6966 18.241L16.2591 16.8035C15.417 15.9614 14.0517 15.9614 13.2097 16.8035L11.7722 18.241C11.3678 18.6454 10.8194 18.8726 10.2475 18.8726H1.07812"
        stroke="currentColor"
        strokeWidth="2.15625"
        strokeLinecap="round"
      />
      <path
        d="M1.07812 10.9663H6.82812H10.4219H14.0156H24.0781"
        stroke="currentColor"
        strokeWidth="2.15625"
        strokeLinecap="round"
      />
    </chakra.svg>
  );
}
