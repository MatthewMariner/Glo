import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, Tooltip } from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { MdContentCopy } from 'react-icons/md';

export default function MessageBox(props: {
  index: number;
  output: string;
  hasClickedGetStarted: boolean;
  setHasClickedGetStarted: React.Dispatch<React.SetStateAction<boolean>>;
  isUser: boolean;
  isLastMessage: boolean;
}) {
  const {
    index,
    output,
    hasClickedGetStarted,
    setHasClickedGetStarted,
    isUser,
    isLastMessage,
  } = props;

  const displayedTextRef = useRef('');
  const [_, setRender] = useState(false);

  useEffect(() => {
    // Read the value from local storage and update state
    const hasStarted = localStorage.getItem('mm_glo_hasStarted');
    if (hasStarted) {
      setHasClickedGetStarted(true);
    }

    displayedTextRef.current = '';

    displayedTextRef.current = output;
    setRender((prev) => !prev);

    //let i = 0;
    // if (isLastMessage) {
    //   const intervalId = setInterval(() => {
    //     if (i < output.length) {
    //       displayedTextRef.current += output[i];
    //       setRender((prev) => !prev); // This will trigger a re-render
    //       i++;
    //     } else {
    //       clearInterval(intervalId);
    //     }
    //   }, 1);

    //   return () => {
    //     clearInterval(intervalId);
    //   };
    // } else {
    //   displayedTextRef.current = output;
    //   setRender((prev) => !prev);
    // }
  }, [output, isLastMessage]);

  const getStarted = () => {
    setHasClickedGetStarted(true);
    // Store the value in local storage when clicked
    localStorage.setItem('mm_glo_hasStarted', 'true');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can notify the user that the text has been copied
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const cardBackground = isUser ? '#e1e8f0' : 'white';

  useEffect(() => {
    const hasStarted = localStorage.getItem('mm_glo_hasStarted');
    if (hasStarted) {
      setHasClickedGetStarted(true);
    }
  }, []);

  return (
    <>
      <Card
        display={output ? 'flex' : 'none'}
        px="22px !important"
        pl="22px !important"
        mx={'20px'}
        my={'10px'}
        color={'#2B2B2B'}
        fontSize={{ base: 'sm', md: 'md' }}
        lineHeight={{ base: '24px', md: '26px' }}
        fontWeight="500"
        maxWidth={{ base: '48rem' }}
        backgroundColor={cardBackground}
      >
        {!isUser && index > 0 && (
          <Tooltip label="Copy to Clipboard" hasArrow placement="top-end">
            <Button
              top="10px"
              right="10px"
              size="sm"
              color="white"
              background="gray"
              _hover={{ opacity: 0.8 }}
              onClick={() =>
                copyToClipboard(displayedTextRef.current).catch(console.error)
              }
              position="absolute"
            >
              <MdContentCopy />
            </Button>
          </Tooltip>
        )}
        <ReactMarkdown className="font-medium markdown-container">
          {displayedTextRef.current}
        </ReactMarkdown>

        <Button
          width="100%"
          height="49px"
          background="#296FFA"
          border="1px solid var(--unnamed-color-296ffa)"
          borderRadius="25px"
          opacity="1"
          color={'white'}
          alignSelf={'center'}
          mt={'40px'}
          display={hasClickedGetStarted ? 'none' : 'flex'}
          onClick={getStarted}
          _hover={{
            opacity: 0.8,
          }}
        >
          {'Get Started!'}
        </Button>
      </Card>
    </>
  );
}
