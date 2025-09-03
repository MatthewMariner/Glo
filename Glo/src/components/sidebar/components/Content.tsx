'use client';
// chakra imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
import mmUser from '/public/img/avatars/unnamed.png';
import { NextAvatar } from '@/components/image/Avatar';
import APIModal from '@/components/apiModal';
import Brand from '@/components/sidebar/components/Brand';
import Links from '@/components/sidebar/components/Links';
import ChatHistory from '@/components/sidebar/components/ChatHistory';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import { RoundedChart } from '@/components/icons/Icons';
import { PropsWithChildren } from 'react';
import { IRoute } from '@/types/navigation';
import { IoMdPerson } from 'react-icons/io';
import { FiLogOut } from 'react-icons/fi';
import { LuHistory } from 'react-icons/lu';
import { MdOutlineManageAccounts, MdOutlineSettings } from 'react-icons/md';
import { useChatContext } from '../../../contexts/ChatContext';
import { useAuth } from '@/providers/auth/AuthProvider';

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarContent(props: SidebarContent) {
  const { routes, setApiKey } = props;
  const { currentUser } = useAuth();

  // console.log(currentUser);
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const { chatData } = useChatContext(); // Use chatData from context

  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const bgColor = useColorModeValue('white', 'navy.700');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(12, 44, 55, 0.18)',
  );
  const iconColor = useColorModeValue('navy.700', 'white');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none',
  );
  const gray = useColorModeValue('gray.400', 'white');

  function truncateEmail(email: string | undefined) {
    if (!email) return 'User@Masstermind.com';
    return email.length > 30 ? email.slice(0, 30) + '...' : email;
  }

  // SIDEBAR
  return (
    <Flex
      direction="column"
      height="100%"
      pb="26px"
      borderRadius="30px"
      maxW="330px"
    >
      <Flex
        mt="8px"
        justifyContent="space-between"
        alignItems="center"
        boxShadow={shadowPillBar}
        borderRadius="30px"
        p="14px"
      >
        <Flex alignContent={'baseline'}>
          <NextAvatar h="51px" w="53px" src={mmUser} me="10px" />
          <Flex justifyContent="flex-start" flexDirection={'column'} mt="5px">
            <Text color={textColor} fontSize="sm" fontWeight="600" me="10px">
              {currentUser?.fullName || 'Mastermind User'}
            </Text>
            <Text color={gray} fontSize="xs" fontWeight="600" me="10px">
              {truncateEmail(currentUser?.email)}
            </Text>
          </Flex>
        </Flex>

        {/* <Flex justifyContent={'flex-end'}>
          <NavLink href="/settings">
            <Menu>
              <MenuButton
                as={Button}
                variant="transparent"
                aria-label=""
                border="1px solid"
                borderColor={borderColor}
                borderRadius="full"
                w="34px"
                h="34px"
                px="0px"
                p="0px"
                minW="34px"
                me="10px"
                justifyContent={'center'}
                alignItems="center"
                color={iconColor}
              >
                <Flex align="center" justifyContent="center">
                  <Icon
                    as={MdOutlineSettings}
                    width="18px"
                    height="18px"
                    color="inherit"
                  />
                </Flex>
              </MenuButton>
              <MenuList
                ps="20px"
                w="200px"
                borderRadius="12px"
                transform="translate(-19px, -62px)!important"
                border="0px"
                boxShadow={shadow}
                bg={bgColor}
                alignSelf={'center'}
              >
                <Box>
                  <Flex align="center">
                    <Icon
                      as={MdOutlineManageAccounts}
                      width="24px"
                      height="24px"
                      color={'#313131'}
                      me="12px"
                    />
                    <Text color={'#313131'} fontWeight="500" fontSize="sm">
                      Profile Settings
                    </Text>
                  </Flex>
                </Box>
                <Box mb="30px">
                  <NavLink href="/history">
                    <Flex align="center">
                      <Icon
                        as={LuHistory}
                        width="24px"
                        height="24px"
                        color={gray}
                        me="12px"
                      />
                      <Text color={gray} fontWeight="500" fontSize="sm">
                        History
                      </Text>
                    </Flex>
                  </NavLink>
                </Box>
                <Box mb="30px">
                  <NavLink href="/usage">
                    <Flex align="center">
                      <Icon
                        as={RoundedChart}
                        width="24px"
                        height="24px"
                        color={gray}
                        me="12px"
                      />
                      <Text color={gray} fontWeight="500" fontSize="sm">
                        Usage
                      </Text>
                    </Flex>
                  </NavLink>
                </Box>
                <Box>
                  <NavLink href="/my-plan">
                    <Flex align="center">
                      <Icon
                        as={IoMdPerson}
                        width="24px"
                        height="24px"
                        color={gray}
                        me="12px"
                      />
                      <Text color={gray} fontWeight="500" fontSize="sm">
                        My Plan
                      </Text>
                    </Flex>
                  </NavLink>
                </Box>
              </MenuList>
            </Menu>
          </NavLink>
        </Flex> */}
        {/* <Button
          variant="transparent"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="full"
          w="34px"
          h="34px"
          px="0px"
          minW="34px"
          justifyContent={'center'}
          alignItems="center"
        >
          <Icon as={FiLogOut} width="16px" height="16px" color="inherit" />
        </Button> */}
      </Flex>
      <Brand />
      {}
      {currentUser?.role === 'ADMIN' ? (
        <Stack direction="column">
          <Flex
           bg={boxBg}
            mt="8px"
            justifyContent="space-between"
            alignItems="center"
            boxShadow={shadowPillBar}
            borderRadius="10px"
            p="14px"
          >
            <Box ps="0px">
              <Links routes={routes} />
            </Box>
          </Flex>
        </Stack>
      ) : (
        <></>
      )}

      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }}>
          <ChatHistory chatData={chatData} />
        </Box>
      </Stack>

      {/* <Box mt="60px" width={'100%'} display={'flex'} justifyContent={'center'}>
        <SidebarCard />
      </Box> */}
      {/* <APIModal setApiKey={setApiKey} sidebar={true} /> */}
    </Flex>
  );
}

export default SidebarContent;
