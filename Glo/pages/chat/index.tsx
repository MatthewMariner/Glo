/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { clearTimeout, setTimeout } from 'timers';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Flex,
  Button,
  Img,
  Menu,
  MenuButton,
  Box,
  useDisclosure,
  Text,
  useToast,
} from '@chakra-ui/react';
import { AutoResizeTextarea } from '@/components/inputs/AutoResizeTextArea';
import Card from '@/components/card/Card';
import { ChevronUpIcon, HamburgerIcon } from '@chakra-ui/icons';
import { NextAvatar } from '@/components/image/Avatar';
import MessageBoxChat from '@/components/MessageBoxChat';
import { ChatBody } from '@/types/types';
import glo from '/public/img/avatars/glo2.png';
import mmUser from '/public/img/avatars/unnamed.png';
import { useChatContext } from '../../src/contexts/ChatContext';
import { useAuth } from '@/providers/auth/AuthProvider';
import SelectCategoryModal from './SelectCategoryModal';
import MessageLoadingIndicator from './MessageLoadingIndicator';

import { io, Socket } from 'socket.io-client';

type ChatMessage = {
  isUser: boolean;
  text: string;
};

export default function Chat() {
  const { currentUser } = useAuth();

  const textColorSecondary = 'gray.500';

  const introductionText = `
  ##### Hey, it's Glo, your 24/7 Mastermind AI Assistant! My goal is to help make sure you never get stuck on the "blank page" ever again. I can help you with things like:
    • Setting goals and making plans for your life or business
    • Gain more “coaching confidence”
    • Finding your ideal client for your knowledge products
    • Creating a framework for a coaching program
    • Laying out a blueprint for how to do a live training
    • And so much more!      

  ##### I'm here to support you on your journey to building the life and business you deserve. Let's get started! How can I help you today?`;

  const {
    refreshChatData,
    selectedConversation,
    currentResponse,
    setCurrentResponse,
    initialScroll,
    setInitialScroll,
  } = useChatContext();
  const [userChatInput, setUserChatInput] = useState<string>('');
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false);
  const [hasCompletedInitialPrompt, setHasCompletedInitialPrompt] =
    useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingNewMessage, setIsLoadingNewMessage] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      isUser: false,
      text: introductionText,
    },
  ]);

  const [selectedQuestionCategory, setSelectedQuestionCategory] =
    useState<string>('');
  const [selectedQuestionCategoryId, setSelectedQuestionCategoryId] = useState<
    number | null
  >(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const reconnectingTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true); // for scrolling

  const [refreshKey, setRefreshKey] = useState(0); // Add refreshKey state to force re-mount

  const router = useRouter();

  const messageBeginRef = useRef<HTMLDivElement | null>(null); //for scrolling

  const userId = currentUser?.id;
  const maxCodeLength = 700;

  const webSocketClient = useRef<SocketIOClient.Socket | null>(null);
  const wsURL = process.env.NEXT_PUBLIC_WS_URL;

  const toast = useToast();

  // Scrolling Behavior
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight;
      setIsUserAtBottom(isAtBottom);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      // clean up the event listener when the component unmounts
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scrolling Behavior
  useEffect(() => {
    // Only do something if the user is at the bottom of the page
    if (isUserAtBottom && !isLoading) {
      if (conversationId === null && currentResponse.length > 0) {
        // console.log('firing 2');

        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          });
        }, 250);
      }

      if (conversationId) {
        if (currentResponse.length === 0 && isLoadingNewMessage) {
          // console.log('firing 3');

          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          });
        }

        if (messages.length > 0 && !isLoading && currentResponse.length > 0) {
          //scroll bottom, after content generated
          // console.log('firing 4');
          setTimeout(() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth',
            });
          }, 100);
        }
      }
    }

    if (isUserAtBottom && isLoading) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }

    if (!initialScroll) {
      setInitialScroll(true);

      //Scroll to bottom to `lock in`
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 250);

      // console.log('firing');
    }
  }, [messages, currentResponse, conversationId, isUserAtBottom, isLoading]);

  //is loading in case it gets stuck
  const [loadingTimeoutId, setLoadingTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      setLoadingTimeoutId(null);
    }

    // If isLoadingNewMessage is true, set a timeout to refresh the page after 15 seconds
    if (isLoadingNewMessage) {
      const timeoutId = setTimeout(() => {
        // If still loading after 15 seconds, refresh the page
        if (isLoadingNewMessage) {
          toast({
            title: 'Timeout',
            description: 'Glo timed out - refreshing the page...',
            status: 'warning',
            duration: 2500,
            isClosable: true,
          });
          router.reload();
          // setRefreshKey((prevKey) => prevKey + 1); // Change the key state to re-mount the component
        }
      }, 15e3);
      setLoadingTimeoutId(timeoutId);
    }
  }, [isLoadingNewMessage, router]);

  // Websockets
  useEffect(() => {
    webSocketClient.current = io(wsURL);

    webSocketClient.current.on('connect', () => {
      console.log('Socket.io Client Connected');
      toast({
        title: 'Connected',
        description: 'Connected to Glo',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      setIsReconnecting(false);

      // If there is a reconnecting timeout scheduled, clear it
      if (reconnectingTimeoutId.current) {
        clearTimeout(reconnectingTimeoutId.current);
        reconnectingTimeoutId.current = null;
      }
    });

    webSocketClient.current.on('message', (message) => {
      let dataFromServer;

      try {
        dataFromServer = JSON.parse(message);
      } catch (e) {
        dataFromServer = { responseText: message };
      }

      // console.log('dataFromServer', dataFromServer);
      // console.log('message', message);

      const { responseText, conversationId } = dataFromServer;

      let cleanedResponseText;

      if (responseText) {
        cleanedResponseText = responseText.replace(/&nbsp(?![;])/g, '&nbsp;');

        if (cleanedResponseText) {
          setCurrentResponse(cleanedResponseText); // Update the current response
          setIsLoadingNewMessage(false);
        }
      }

      if (dataFromServer.isDone) {
        const cleanedResponseText = responseText.replace(
          /&nbsp(?![;])/g,
          '&nbsp;',
        );

        setIsLoadingNewMessage(false);
        setCurrentResponse('');

        setConversationId(conversationId);

        setMessages((prevMessages) => [
          ...prevMessages,
          { isUser: false, text: cleanedResponseText },
        ]);
        //update sidebar
        refreshChatData(true, conversationId);
        setIsLoading(false);
        setHasCompletedInitialPrompt(true);

        return;
      }
    });

    // When the connection closes or errors
    webSocketClient.current.on('disconnect', () => {
      console.log('Socket.io Client Disconnected');
      setIsReconnecting(true); // Set reconnecting state when disconnected
      setIsLoading(true);

      reconnectingTimeoutId.current = setTimeout(() => {
        if (webSocketClient.current?.disconnected) {
          toast({
            title: 'Connection Error',
            description:
              'Glo backend is busy - please refresh the page and try again',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }, 30e3); // Schedule a timeout to show a toast if still disconnected after 30 seconds

      // Reconnect after a delay
      setTimeout(() => {
        console.log(`Reconnecting... to ${wsURL}`);
        webSocketClient.current = io(wsURL);
        setIsLoading(false);
        setIsReconnecting(false);
      }, 250);
    });

    webSocketClient.current.on('connect_error', (error) => {
      console.error(`Socket.io Error: ${JSON.stringify(error)}`);
      setIsLoading(false);
      setIsLoadingNewMessage(false);
      setIsReconnecting(true);
    });

    // Cleanup function to close socket when component unmounts
    return () => {
      console.log('Disconnecting socket.io on component unmount');
      if (webSocketClient.current) {
        webSocketClient.current.disconnect();
      }
      // Also clear any reconnecting timeout on unmount
      if (reconnectingTimeoutId.current) {
        clearTimeout(reconnectingTimeoutId.current);
        reconnectingTimeoutId.current = null;
      }
    };
  }, []);

  const createChatFlow = async () => {
    setIsLoading(true);
    setIsLoadingNewMessage(true);

    if (!initialScroll) {
      setInitialScroll(true);

      //Scroll to bottom to `lock in`
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 250);

      // console.log('firing');
    }

    const updatedMessages = [
      ...messages,
      { isUser: true, text: selectedQuestionCategory || userChatInput },
    ];

    const userPromptId = selectedQuestionCategoryId;

    setMessages(updatedMessages);
    setUserChatInput('');
    setSelectedQuestionCategory('');
    setSelectedQuestionCategoryId(null);

    const body: ChatBody = {
      messages: formatChatMessages(updatedMessages),
      userId,
      conversationId,
      userPromptId: userPromptId,
    };

    // Send message to server
    webSocketClient.current.emit('message', body);
  };

  const resetChatState = () => {
    setUserChatInput('');
    setHasClickedGetStarted(false);
    setMessages([
      {
        isUser: false,
        text: introductionText,
      },
    ]);
    setIsLoading(false);
    setIsLoadingNewMessage(false);
    setConversationId(null);
    setHasCompletedInitialPrompt(false);
    setSelectedQuestionCategory('');
    setSelectedQuestionCategoryId(null);
    setError(null);
  };

  const fetchConversation = async (id: number) => {
    setIsLoading(true);
    setConversationId(id);

    try {
      const response = await fetch(`/api/prisma/getChatById?id=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const chatData = await response.json();
      const formattedMessages = chatData.messages.map((message: any) => ({
        isUser: message.userId !== null,
        text: message.content,
      }));

      setMessages([messages[0], ...formattedMessages]); //we dont save the initial `Hi I'm GLo`, so append it here
    } catch (error) {
      console.error('Fetch Error:', error);
      setError('Fetch Error');
    }

    setIsLoading(false);
  };

  const formatChatMessages = (messages: ChatMessage[]) => {
    const emojiRegex =
      /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\u200D/g;
    return messages.map((message) => ({
      role: message.isUser ? 'user' : 'assistant',
      content: message.text.replace(/\n/g, '').replace(emojiRegex, '').trim(),
    }));
  };

  const handleChatSubmission = async () => {
    //Validation
    if (!userChatInput) {
      toast({
        title: 'Error',
        description: 'Please enter your question and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (userChatInput.length > maxCodeLength) {
      toast({
        title: 'Error',
        description: `Please enter code less than ${maxCodeLength} characters. You are currently at ${userChatInput.length} characters.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Prevent sending new messages when reconnecting
    if (isReconnecting) {
      toast({
        title: 'Alert',
        description:
          'The server is under heavy load, please wait a moment and try again',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    //API
    try {
      await createChatFlow();
    } catch (error) {
      console.error('createChatFlow Error:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserChatInput(event.target.value);
  };

  const handleClick = () => {
    handleChatSubmission();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleChatSubmission();
    }
  };

  const showModal = () => {
    if (isLoading) {
      return;
    } else {
      onOpen();
    }
  };

  useEffect(() => {
    if (selectedQuestionCategory) {
      if (isReconnecting) {
        toast({
          title: 'Alert',
          description:
            'The server is under heavy load, please wait a moment and try again',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const updatedMessages = [
        ...messages,
        { isUser: true, text: selectedQuestionCategory },
      ];

      setMessages(updatedMessages);
      createChatFlow();
    }
  }, [selectedQuestionCategory]);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversation(selectedConversation); //this auto overwrites messages
      setHasCompletedInitialPrompt(true);
    } else {
      setConversationId(null);
      resetChatState();
    }
  }, [selectedConversation]);

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
      background="transparent"
      ref={messageBeginRef}
      key={refreshKey}
    >
      <SelectCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        onSelect={(prompt, id) => {
          setSelectedQuestionCategory(prompt);
          setSelectedQuestionCategoryId(id);
        }}
      />

      <Img
        src={'/img/chat/bg-image.png'}
        position="absolute"
        w="100%"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        opacity={'30%'}
        zIndex="0"
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        minH={{ base: '75vh', '2xl': '85vh' }}
        maxW="1000px"
        zIndex="99"
      >
        <Flex
          direction="column"
          display={messages.length > 0 ? 'flex' : 'none'}
          w="100%"
          mx="auto"
          mb="auto"
        >
          {messages.map((message, i) => (
            <Flex
              key={i}
              w="100%"
              justify="center"
              bg={'transparent'}
              align="flex-start"
            >
              {!message.isUser ? (
                <NextAvatar h="55px" w="55px" src={glo} me="10px" mt="10px" />
              ): (
                null
                //@TODO - revisit and clean this up
                //<Box h="61px" w="73px" me="10px" mt="10px"></Box>
              )}

              <MessageBoxChat
                index={i}
                output={message.text}
                isUser={message.isUser}
                hasClickedGetStarted={hasClickedGetStarted}
                setHasClickedGetStarted={setHasClickedGetStarted}
                isLastMessage={i === messages.length - 1}
              />
            </Flex>
          ))}
          {isLoadingNewMessage ? (
            <Flex
              w="100%"
              justify="center"
              bg={'transparent'}
              align="flex-start"
            >
              <NextAvatar h="55px" w="55px" src={glo} me="10px" mt="10px" />
              <Card
                display={'flex'}
                px="22px !important"
                pl="22px !important"
                mx={'20px'}
                my={'10px'}
                py="35px"
                color={'#2B2B2B'}
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight={{ base: '24px', md: '26px' }}
                fontWeight="500"
                maxWidth={{ base: '48rem' }}
                backgroundColor="white"
              >
                <MessageLoadingIndicator />
              </Card>
            </Flex>
          ) : (
            <></>
          )}
        </Flex>

        {currentResponse && !isLoadingNewMessage && (
          <Flex w="100%" justify="center" bg={'transparent'} align="flex-start">
            <NextAvatar h="55px" w="55px" src={glo} me="10px" mt="10px" />
            <MessageBoxChat
              output={currentResponse}
              isUser={false}
              hasClickedGetStarted={hasClickedGetStarted}
              setHasClickedGetStarted={setHasClickedGetStarted}
              isLastMessage={false}
              index={conversationId}
            />
          </Flex>
        )}

        <Flex
          mt="20px"
          justifySelf="center"
          display={
            hasClickedGetStarted && !hasCompletedInitialPrompt ? 'flex' : 'none'
          }
          zIndex="99"
        >
          <Menu>
            {({ isOpen }) => (
              <MenuButton
                onClick={showModal}
                as={Box}
                minH="54px"
                width="100%"
                h="100%"
                border="1px solid #DBDADA"
                borderColor={'gray.200'}
                borderRadius="15px"
                p="15px 25px"
                me="10px"
                fontSize="20px"
                fontWeight="500"
                _focus={{ borderColor: 'none' }}
                color={'navy.700'}
                _placeholder={{
                  color: 'gray.500',
                }}
                background={
                  isLoading ? '#F8F8F8' : ' #FFFFFF 0% 0% no-repeat padding-box'
                }
                disabled={isLoading}
                cursor={isLoading ? 'not-allowed' : 'pointer'}
                display={hasClickedGetStarted ? 'flex' : 'none'}
              >
                <Flex
                  alignContent={'baseline'}
                  width="100%"
                  justifyContent="space-between"
                >
                  <Flex width="200px" alignContent={'center'}>
                    <HamburgerIcon
                      color={textColorSecondary}
                      alignSelf="center"
                      marginBottom={'5px'}
                      boxSize={6}
                      mr={3}
                    />
                    <Text
                      color={textColorSecondary}
                      fontWeight="500"
                      borderRadius="45px"
                      zIndex="99"
                    >
                      Select Question
                    </Text>
                  </Flex>

                  <ChevronUpIcon boxSize={8} ml={2} />
                </Flex>
              </MenuButton>
            )}
          </Menu>
        </Flex>
        <Flex
          mt="20px"
          justifySelf="center"
          display={hasClickedGetStarted ? 'flex' : 'none'}
          zIndex="99"
          justifyContent="center"
          alignItems="center"
        >
          <AutoResizeTextarea
            minH="24px"
            h="100%"
            border="1px solid"
            borderColor={'gray.200'}
            borderRadius="45px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: '#296ffa' }}
            color={'navy.900'}
            top={'10px'}
            _placeholder={{
              color: 'gray.500',
              padding: '1px 0px 0px 1px',
            }}
            resize={'vertical'}
            placeholder={
              hasCompletedInitialPrompt
                ? 'Type your message here...'
                : 'Or type your message here...'
            }
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            background="white"
            value={userChatInput}
            disabled={isLoading}
            marginRight="10px"
            position="initial"
            height="55px"
            padding="15px 15px 15px 25px"
            overflow="hidden"
          />

          <Button
            background="#296FFA"
            color="white"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{ opacity: 0.8 }}
            onClick={handleClick}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
