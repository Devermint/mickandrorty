import { Box, VStack, Text, Flex, Button, Drawer, Portal } from "@chakra-ui/react";
import HomeIcon from "../icons/home";
import CreateIcon from "../icons/create";
import ChatsIcon from "../icons/chats";
import StakeIcon from "../icons/stake";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BaseIconColor = "#99B637";
const ActiveIconColor = "#000000";
const ActiveBackgroundColor = "#AFDC29";

const NavButtonsInitial = [
  { active: false, text: "Home", icon: HomeIcon, page: "/home" },
  { active: false, text: "Create", icon: CreateIcon, page: "/create" },
  { active: false, text: "My Chats", icon: ChatsIcon, page: "/chats" },
  { active: false, text: "Stake", icon: StakeIcon, page: "/stake" },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItemProps = {
  text: string;
  backgroundColor?: string;
  icon: React.ReactElement;
  onClick: (id: string) => void;
  isActive: boolean;
};

function NavItem({ text, backgroundColor, icon, onClick, isActive }: NavItemProps) {
  return (
    <Flex
      direction="row"
      alignItems="center"
      cursor="pointer"
      padding="1rem"
      gap="1rem"
      onClick={() => onClick(text)}
      borderRadius="8px"
      _hover={{ bg: "#1D311420" }}
      bg={backgroundColor}
      width="100%"
    >
      <Box
        width="36px"
        height="36px"
        borderRadius="4px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </Box>
      <Text
        color={isActive ? "black" : "#99B637"}
        userSelect="none"
        fontWeight="500"
        fontSize="16px"
      >
        {text}
      </Text>
    </Flex>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [navButtons, setNavButtons] = useState(NavButtonsInitial);
  const router = useRouter();
  const pathname = usePathname();

  const handleButtonClick = (id: string) => {
    const button = navButtons.find((button) => button.text === id);
    if (button) {
      router.push(button.page);
      onClose();
    }
  };

  useEffect(() => {
    setNavButtons((n) => {
      const updated = n.map((button) => ({
        ...button,
        active: button.page === pathname,
      }));
      return updated;
    });
  }, [pathname]);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="#1D3114">
            <Drawer.Header display="flex" justifyContent="space-between">
              <Drawer.Title>Navigation</Drawer.Title>
              <Drawer.CloseTrigger onClick={onClose} asChild>
                <Button>x</Button>
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body>
              <VStack gap={2} width="100%">
                {navButtons.map((button, index) => (
                  <NavItem
                    key={index}
                    text={button.text}
                    onClick={handleButtonClick}
                    isActive={button.active}
                    icon={button.icon(button.active ? ActiveIconColor : BaseIconColor)}
                    backgroundColor={button.active ? ActiveBackgroundColor : undefined}
                  />
                ))}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
