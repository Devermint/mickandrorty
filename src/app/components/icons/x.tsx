import { chakra, IconProps } from "@chakra-ui/react";

export function X(props: IconProps) {
  return (
    <chakra.svg viewBox="0 0 14 14" {...props}>
      <path
        d="M8.21012 6.00469L12.9456 0.5H11.8233L7.71165 5.27953L4.42752 0.5H0.639648L5.60585 7.72759L0.639648 13.5H1.76191L6.10412 8.45265L9.57227 13.5H13.3601L8.20981 6.00469H8.21012ZM6.67307 7.79117L6.16983 7.0715L2.16623 1.3448H3.88995L7.12076 5.9665L7.6239 6.68617L11.8238 12.6936H10.1003L6.67307 7.79148V7.79117Z"
        fill="currentColor"
      />
    </chakra.svg>
  );
}
