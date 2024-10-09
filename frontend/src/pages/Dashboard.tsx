import {
  Box,
  Drawer,
  DrawerContent,
  Flex,
  HStack,
  Heading,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { BiMenu } from "react-icons/bi";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineClose,
  AiOutlineMail,
} from "react-icons/ai";
import { RiEarthLine } from "react-icons/ri";
import ThemeToggle from "./ThemeToggle";
import SMSStatistics from "./SMSStatistics";
import { RateLimitViolations } from "./RateLimitViolations";

const listItems = [
  {
    text: "Home",
    icon: AiOutlineHome,
  },
  {
    text: "SMS",
    icon: AiOutlineMail,
  },

  {
    text: "Settings",
    icon: AiOutlineSetting,
  },
];

export default function DrawerNavigation() {
  const { getButtonProps, isOpen, onClose } = useDisclosure();
  const buttonProps = getButtonProps();

  const currentsBreakpoint = useBreakpointValue({ lg: "lg" }, { ssr: false });
  if (currentsBreakpoint === "lg" && isOpen) {
    onClose();
  }

  return (
    <>
      <Flex
        as="nav"
        alignItems="center"
        justifyContent={{ base: "space-between", lg: "flex-end" }}
        h="10vh"
        p="2.5"
      >
        <HStack spacing={2} display={{ base: "flex", lg: "none" }}>
          <IconButton
            {...buttonProps}
            fontSize="18px"
            variant="ghost"
            icon={<BiMenu />}
            aria-label="open menu"
          />
          <Heading as="h1" size="md">
            SMS
          </Heading>
        </HStack>
        <HStack spacing="1">
          <IconButton
            variant="ghost"
            isRound={true}
            size="lg"
            aria-label="earth icon"
            icon={<RiEarthLine />}
          />
          <IconButton
            isRound={true}
            size="lg"
            aria-label="user icon"
            icon={<AiOutlineUser />}
          />
          <ThemeToggle />
        </HStack>
      </Flex>
      <HStack align="start" spacing={0}>
        <Aside onClose={onClose} display={{ base: "none", lg: "block" }} />
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="xs"
        >
          <DrawerContent>
            <Aside onClose={onClose} isOpen={isOpen} />
          </DrawerContent>
        </Drawer>
        <Flex
          as="main"
          ml={{ base: 0, lg: "60" }}
          w="full"
          minH="90vh"
          align="center"
          justify="center"
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <Box textAlign="center">
            <Heading as="h3">Statistics</Heading>
            <SMSStatistics />
            <RateLimitViolations />
          </Box>
        </Flex>
      </HStack>
    </>
  );
}

type AsideProps = {
  display?: {
    base: string;
    lg: string;
  };
  onClose: () => void;
  isOpen?: boolean;
};

const Aside = ({ onClose, isOpen, ...rest }: AsideProps) => {
  return (
    <Box
      as="aside"
      borderRight="2px"
      borderColor={useColorModeValue("gray.200", "gray.900")}
      w={{ base: "100%", lg: 60 }}
      top="0"
      pos="fixed"
      h="100%"
      minH="100vh"
      zIndex={99}
      {...rest}
    >
      <HStack p="2.5" h="10vh" justify="space-between">
        <Heading as="h1" size="md">
          SMS App
        </Heading>
        <IconButton
          onClick={onClose}
          display={isOpen ? "flex" : "none"}
          fontSize="18px"
          variant="ghost"
          icon={<AiOutlineClose />}
          aria-label="open menu"
        />
      </HStack>
      <Box>
        <List spacing={0} p="0.5">
          {listItems.map((item, index) => (
            <ListElement key={index} icon={item.icon} text={item.text} />
          ))}
        </List>
      </Box>
    </Box>
  );
};

const ListElement = ({
  icon,
  text,
}: {
  icon: React.ElementType;
  text?: string;
}) => {
  return (
    <ListItem
      as={HStack}
      spacing={0}
      h="10"
      pl="2.5"
      cursor="pointer"
      _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
      rounded="md"
    >
      <ListIcon boxSize={5} as={icon} />
      {text && <Text>{text}</Text>}
    </ListItem>
  );
};
