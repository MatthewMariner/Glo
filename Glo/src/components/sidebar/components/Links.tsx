import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Text,
  List,
  Icon,
  ListItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoMdAdd } from 'react-icons/io';
import NavLink from '@/components/link/NavLink';
import Link from 'next/link';
import { IRoute } from '@/types/navigation';
import { PropsWithChildren, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
}

export function SidebarLinks({ routes }: SidebarLinksProps) {
  const pathname = usePathname();

  const colorSettings = {
    activeColor: useColorModeValue('navy.700', 'white'),
    inactiveColor: useColorModeValue('gray.500', 'gray.500'),
    borderColor: useColorModeValue('gray.200', 'whiteAlpha.300'),
    activeIcon: useColorModeValue('brand.500', 'white'),
    iconColor: useColorModeValue('navy.700', 'white'),
  };

  const activeRoute = useCallback(
    (routeName: string) => pathname?.includes(routeName),
    [pathname],
  );

  return <>{createLinks(routes, colorSettings, activeRoute)}</>;
}

const createLinks = (
  routes: IRoute[],
  colorSettings: any,
  activeRoute: any,
) => {
  const { activeColor, inactiveColor, activeIcon, iconColor, borderColor } =
    colorSettings;
  return routes.map((route: IRoute, key: number) => {
    const isRouteActive = activeRoute(route.path.toLowerCase());
    const linkColor = isRouteActive ? activeColor : inactiveColor;
    const iconBoxColor = isRouteActive ? activeIcon : inactiveColor;
    const linkStyles = { width: '100%' };
    if (route.collapse && !route.invisible) {
      return (
        <Accordion allowToggle key={key}>
          <AccordionItem border="none" mb="14px">
            <AccordionButton
              display="flex"
              alignItems="center"
              mb="4px"
              justifyContent="center"
              _hover={{
                bg: 'unset',
              }}
              _focus={{
                boxShadow: 'none',
              }}
              borderRadius="8px"
              w="100%"
              py="0px"
              ms={0}
            >
              <LinkContent
                route={route}
                linkColor={linkColor}
                iconBoxColor={iconBoxColor}
                isRouteActive={isRouteActive}
                borderColor={borderColor}
                iconColor={iconColor}
              />

              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel py="0px" ps={'8px'}>
              <List>
                {route.icon && route.items
                  ? createLinks(route.items, colorSettings, activeRoute) // for bullet accordion links
                  : route.items
                  ? createAccordionLinks(route, key)
                  : ''}
              </List>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      );
    } else if (!route.invisible) {
      return (
        <Flex
          align="center"
          justifyContent="space-between"
          w="100%"
          maxW="100%"
          ps="17px"
          mb="0px"
          key={key}
        >
          <HStack w="100%" mb="14px">
            <NavLink
              href={route.layout ? route.layout + route.path : route.path}
              styles={linkStyles}
            >
              <LinkContent
                route={route}
                linkColor={linkColor}
                iconBoxColor={iconBoxColor}
                isRouteActive={isRouteActive}
                borderColor={borderColor}
                iconColor={iconColor}
              />
            </NavLink>
          </HStack>
        </Flex>
      );
    }
  });
};

const LinkContent = ({
  route,
  linkColor,
  iconBoxColor,
  isRouteActive,
  borderColor,
  iconColor,
}) =>
  route.icon ? (
    <Flex align="center" justifyContent="space-between" w="100%">
      <HStack spacing={isRouteActive ? '22px' : '26px'}>
        <Flex w="100%" alignItems="center" justifyContent="center">
          <Box color={iconBoxColor} me="12px" mt="6px">
            {route.icon}
          </Box>
          <Text
            me="auto"
            color={linkColor}
            fontWeight="500"
            letterSpacing="0px"
            fontSize="sm"
          >
            {route.name}
          </Text>
        </Flex>
      </HStack>
      {route.rightElement ? (
        <Flex
          border="1px solid"
          borderColor={borderColor}
          borderRadius="full"
          w="34px"
          h="34px"
          justify={'center'}
          align="center"
          color={iconColor}
          ms="auto"
          me="10px"
        >
          <Icon as={IoMdAdd} width="20px" height="20px" color="inherit" />
        </Flex>
      ) : null}
    </Flex>
  ) : (
    <ListItem ms={0}>
      <Flex paddingTop="5px" alignItems="center" mb="8px">
        <Text color={linkColor} fontWeight="500" fontSize="xs">
          {route.name}
        </Text>
      </Flex>
    </ListItem>
  );

const createAccordionLinks = (route: IRoute, index: number) => {
  const { items, path, name, icon, collapse } = route;

  if (collapse) {
    return (
      <AccordionItem key={`${name}-${index}`}>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              {name}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          {items?.map((item, idx) => (
            <Link
              href={`${path}${item.path}`}
              passHref
              key={`${item.name}-${idx}`}
            >
              {item.name}
            </Link>
          ))}
        </AccordionPanel>
      </AccordionItem>
    );
  } else {
    return (
      <Link href={path} passHref key={`${name}-${index}`}>
        <HStack spacing={4}>
          <Icon as={icon} />
          {name}
        </HStack>
      </Link>
    );
  }
};

export default SidebarLinks;
