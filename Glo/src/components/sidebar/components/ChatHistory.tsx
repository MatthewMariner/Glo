import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  Image,
  useColorModeValue,
  SlideFade,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FcCalendar } from 'react-icons/fc';
import glo_icon from '../../../../public/img/avatars/glo_icon.svg';
import { useChatContext } from '../../../contexts/ChatContext';
import NavLink from '@/components/link/NavLink';
import { AiFillDelete, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import {
  formatDistanceToNow,
  isThisWeek,
  isToday,
  isThisMonth,
} from 'date-fns';
import { groupBy } from 'lodash';
import { useRouter } from 'next/router';
import { NextAvatar } from '@/components/image/Avatar';

interface ChatHistoryProps {
  chatData: Array<{
    title: string;
    createdAt: Date;
    id: string;
    userId: number | string;
    messages: Array<{
      sender: {
        id: number;
        username: string;
        email: string;
        ipAddress?: string;
        createdAt: Date;
      };
      content: string;
      createdAt: Date;
      userId: number | string;
      conversationId: number;
    }>;
  }>;
}

export function ChatHistory(props: ChatHistoryProps) {
  const {
    selectedConversation,
    setSelectedConversation,
    currentResponse,
    setCurrentResponse,
    setInitialScroll,
    initialScroll,
  } = useChatContext();
  const [chatId, setChatId] = useState<string | null>(null);
  const [visibleChats, setVisibleChats] = useState<Record<string, boolean>>({});
  const [transitioningChats, setTransitioningChats] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSelectedConversation(null);
    setChatId(null);
  }, []);

  useEffect(() => {
    // Check if the selected chat still exists in the chat data
    const chatExists = props.chatData.some(
      (chat) => chat.id === selectedConversation,
    );

    if (!chatExists) {
      setSelectedConversation(null);
      setChatId(null);
    }
  }, [props.chatData, selectedConversation]);

  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');

  const handleChatIdClick = (clickedChatId: number) => {
    // If no chat was selected before, or if a different chat was clicked
    if (!selectedConversation || selectedConversation !== clickedChatId) {
      setInitialScroll(false);
      setCurrentResponse('');
      setSelectedConversation(clickedChatId);
      setChatId(clickedChatId);

      // This check is to prevent unnecessary route changes if we're already on the /chat page
      if (router.pathname !== '/chat') {
        router.push('/chat');
      }
    }
    // If the selected chat is clicked again, reset it
    else if (selectedConversation === clickedChatId) {
      setSelectedConversation(null);
      setChatId(null);
    }
  };
  const startDeleteConversation = (chatId: number) => {
    setConfirmDelete(chatId);
  };

  const cancelDeleteConversation = (chatId: number) => {
    if (confirmDelete === chatId) {
      setConfirmDelete(null);
    }
  };
  const confirmDeleteConversation = async (chatId: number) => {
    setVisibleChats((prev) => ({ ...prev, [chatId]: false }));
    setTransitioningChats((prev) => [...prev, chatId]);

    setTimeout(async () => {
      try {
        // Perform the fetch operation to the API endpoint
        const response = await fetch('/api/prisma/deleteChatById', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversationId: chatId }),
        });

        // Check if the request was successful
        if (response.ok) {
          // Set the selected conversation to null
          setSelectedConversation(null);
          setChatId(null);
          router.push('/chat');
        } else {
          console.error('Error deleting chat:', await response.text());
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }, 250); // Transition duration
  };

  // Copy the array and sort by date in descending order (most recent first)
  const sortedChatData = [...props.chatData].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Group chat data by timeframe
  const groupedChatData = groupBy(sortedChatData, (chat) => {
    const date = new Date(chat.createdAt);
    if (isToday(date)) {
      return 'Today';
    } else if (isThisWeek(date)) {
      return 'This week';
    } else if (isThisMonth(date)) {
      return 'Last month';
    } else {
      return 'Last year';
    }
  });

  const handleNewChatCreation = () => {
    setSelectedConversation(null);
    setChatId(null);
    router.push('/chat');
  };

  const setNewConversationDisabledLogic = () => {
    const path = router.asPath;

    //if URL has `admin/` enable it so they dont get stuck
    if (path.includes('admin/')) {
      return false;
    } else {
      return selectedConversation === null ? true : false;
    }
  };

  return (
    <Flex direction="row">
      <Box width="100%" margin={'0px 0px'}>
        <Flex justify={'flex-start'} align={'center'} pt={'10px'} my="10px">
          <NextAvatar h="20px" w="20px" src={glo_icon} mr="5px" />
          <Text fontSize="md" fontWeight="bold" me="5px">
            Ask Glo!
          </Text>
        </Flex>
        <Button
          onClick={handleNewChatCreation}
          width="247px"
          height="34px"
          background="#FFFFFF 0% 0% no-repeat padding-box"
          border="1px solid #778195"
          borderRadius="7px"
          opacity="1"
          py="7px"
          px="7px"
          mt="10px"
          mb="40px"
          color={gray}
          fontSize="xs"
          disabled={setNewConversationDisabledLogic()}
          variant="secondary"
          w={{ base: '100%' }}
          h="54px"
          _hover={{
            opacity: 0.8,
            _disabled: {
              opacity: 0.3,
            },
          }}
        >
          + Create New Conversation
        </Button>

        <Flex justify={'flex-start'} align={'center'} pb={'10px'} mb="10px">
          <Icon as={FcCalendar} w="16px" h="16px" me="5px" />
          <Text fontSize="md" fontWeight="bold" me="5px">
            History
          </Text>
        </Flex>

        {groupedChatData ? (
          Object.entries(groupedChatData).map(([group, chats]) => (
            <Box key={group}>
              <Text
                color={textColor}
                fontSize="sm"
                fontWeight="normal"
                textDecoration={'underline'}
              >
                {group}
              </Text>
              {(chats as any[])
                .filter((chat) => !transitioningChats.includes(chat.id))
                .map((chat, i) => (
                  <SlideFade
                    offsetY="20px"
                    in={visibleChats[chat.id] !== false}
                    key={i}
                  >
                    <Box
                      p="2"
                      my="10px"
                      bg={selectedConversation === chat.id ? 'gray.200' : ''}
                      key={chat.id}
                      onClick={
                        currentResponse.length
                          ? () => {}
                          : () => handleChatIdClick(chat.id)
                      }
                      cursor="pointer"
                      border={'1px solid lightgray'}
                      borderRadius="6px"
                      className={
                        currentResponse.length
                          ? 'message-history-item-disabled'
                          : ''
                      }
                    >
                      <Flex
                        justifyContent="space-between"
                        flexDirection={'row'}
                      >
                        <Text
                          color={textColor}
                          fontSize="sm"
                          fontWeight="600"
                          me="10px"
                          my="1px"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chat.messages[
                            chat.messages.length - 1
                          ]?.content?.replace(/[^a-zA-Z0-9 ]/g, '')}
                        </Text>
                        {confirmDelete === chat.id ? (
                          <Flex>
                            <Icon
                              as={AiOutlineCheck}
                              color="green.500"
                              onClick={(event) => {
                                event.stopPropagation();
                                confirmDeleteConversation(chat.id);
                              }}
                            />
                            <Icon
                              as={AiOutlineClose}
                              color="red.500"
                              onClick={(event) => {
                                event.stopPropagation();
                                cancelDeleteConversation(chat.id);
                              }}
                            />
                          </Flex>
                        ) : (
                          <Icon
                            as={AiFillDelete}
                            onClick={(event) => {
                              event.stopPropagation();
                              startDeleteConversation(chat.id);
                            }}
                          />
                        )}
                      </Flex>
                      <Text
                        color={gray}
                        fontSize="xs"
                        fontWeight="300"
                        me="10px"
                      >
                        {formatDistanceToNow(new Date(chat.createdAt), {
                          addSuffix: true,
                        })}
                      </Text>
                    </Box>
                  </SlideFade>
                ))}
            </Box>
          ))
        ) : (
          <Box>
            <Text>No chat history yet! Go ahead and ask Glo a question!</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default ChatHistory;
