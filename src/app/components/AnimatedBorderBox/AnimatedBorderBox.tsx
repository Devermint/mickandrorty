import { Box, BoxProps } from "@chakra-ui/react";
import "./styles.css";

interface Props extends BoxProps {
  animationColor: string;
  children: React.ReactNode;
}

const AnimatedBorderBox = ({ animationColor, children, ...rest }: Props) => {
  const borderGlowColors = {
    "--glow-color": `transparent 20%,
      ${animationColor} 30%,
      ${animationColor} 40%,
      ${animationColor} 50%,
      ${animationColor} 60%,
      transparent 70%`,
  } as React.CSSProperties;

  return (
    <Box
      className="animated-pretitle"
      fontFamily="clashDisplayVariable"
      fontWeight={500}
      fontSize={16}
      {...rest}
    >
      {children}
      <Box as="span" className={"animated-border"} style={borderGlowColors} />
      <Box as="span" className={"animated-glow"} style={borderGlowColors} />
    </Box>
  );
};

export default AnimatedBorderBox;
