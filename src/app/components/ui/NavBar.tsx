"use client";

import { Flex, Text, Box } from "@chakra-ui/react";
import HomeIcon from "../icons/home";
import CreateIcon from "../icons/create";
import ChatsIcon from "../icons/chats";
import StakeIcon from "../icons/stake";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useMobileBreak } from "../responsive";
import { useTransitionRouter } from "next-view-transitions";
import { animations } from "./Animations";

const BaseIconColor = "#99B637";
const ActiveIconColor = "#000000";
const ActiveBackgroundColor = "#AFDC29";

// Define the navigation structure with order
const NavButtonsInitial = [
  { active: false, text: "Home", icon: HomeIcon, page: "/home", order: 0 },
  { active: false, text: "Create", icon: CreateIcon, page: "/create", order: 1 },
  { active: false, text: "My Chats", icon: ChatsIcon, page: "/chats", order: 2 },
  // { active: false, text: "Community", icon: CommunityIcon, page: "/community" },
  { active: false, text: "Stake", icon: StakeIcon, page: "/stake", order: 3 },
];

type NavBarButtonProps = {
  text: string;
  backgroundColor?: string;
  icon: React.ReactElement;
  onClick: (id: string) => void;
};

function NavBarButton(props: NavBarButtonProps) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      cursor="pointer"
      padding="0.25rem"
      onClick={() => props.onClick(props.text)}
    >
      <Box
        width="36px"
        height="36px"
        backgroundColor={props.backgroundColor}
        borderRadius="4px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {props.icon}
      </Box>
      <Text userSelect="none" fontWeight="400" fontSize="10px" lineHeight="14px">
        {props.text}
      </Text>
    </Flex>
  );
}

export default function NavBar() {
  const [navButtons, setNavButtons] = useState(NavButtonsInitial);
  const router = useTransitionRouter();
  const isMobile = useMobileBreak();
  const pathname = usePathname();

  const handleButtonClick = (id: string) => {
    navButtons.forEach((button) => {
      button.active = button.text === id;
    });

    const currentIndex = navButtons.findIndex((button) => button.page === pathname);
    const targetIndex = navButtons.findIndex((button) => button.text === id);

    if (currentIndex !== -1 && targetIndex !== -1) {
      // If moving to a higher index (right in the nav bar), slide right
      // If moving to a lower index (left in the nav bar), slide left
      const animation = targetIndex > currentIndex ? animations.slideRight : animations.slideLeft;

      router.push(navButtons[targetIndex].page, {
        onTransitionReady: animation,
      });
    } else {
      // Fallback if we can't determine the direction
      router.push(navButtons[targetIndex].page, {
        onTransitionReady: animations.fadeInOut,
      });
    }
  };

  useEffect(() => {
    setNavButtons((n) => {
      n.forEach((button) => {
        button.active = button.page === pathname;
      });

      return [...n];
    });
  }, [pathname]);

  return (
    <div>
      {isMobile ? (
        <Box position="fixed" bottom="0" width="100%">
          <Flex
            background="#1D311475"
            justify="center"
            borderTopRadius="21px"
            borderTopLeftRadius="28px"
            justifySelf="center"
            gap="1rem"
            width="100%"
          >
            {navButtons.map((button, index) => (
              <NavBarButton
                key={index}
                text={button.text}
                onClick={handleButtonClick}
                icon={button.icon(button.active ? ActiveIconColor : BaseIconColor)}
                backgroundColor={button.active ? ActiveBackgroundColor : undefined}
              />
            ))}
          </Flex>
        </Box>
      ) : (
        <Box position="fixed" bottom="0" width="100%" mb="0.5rem">
          <Flex
            borderRadius="21px"
            background="#3D3E3A1A"
            justify="center"
            justifySelf="center"
            padding="0.5rem"
            gap="2rem"
          >
            {navButtons.map((button, index) => (
              <NavBarButton
                key={index}
                text={button.text}
                onClick={handleButtonClick}
                icon={button.icon(button.active ? ActiveIconColor : BaseIconColor)}
                backgroundColor={button.active ? ActiveBackgroundColor : undefined}
              />
            ))}
          </Flex>
        </Box>
      )}
    </div>
  );
}
