'use client';

import {
  Button,
  Heading,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  LinkBox,
  FormControl,
  Text,
  useToast,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { NextAvatar } from '@/components/image/Avatar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import glo from '/public/img/avatars/glo2.png';
import mmUser from '/public/img/avatars/unnamed.png';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/providers/auth/AuthProvider';
import TermsAndConditions from '@/components/settings/TermsAndConditions';

const LoginPage = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginToggled, setLoginToggled] = useState<boolean>(true);
  const [email, setEmail] = useState<any>(undefined);
  const textColor = useColorModeValue('navy.700', 'white');

  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>();

  const toast = useToast();

  const { logIn } = useAuth();

  //Data
  const name = 'Glo';
  const banner = 'linear-gradient(15.46deg, #296FFF 26.3%, #7B5AFF 86.4%)';

  // Chakra Color Mode
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.500';

  const [step, setStep] = useState(0);

  const showTCs = () => {
    setStep(1);
  };

  const createAccount = async () => {
    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then((response: Response) => response.json())
      .then((data: { ip: string }) => data.ip);

    if (email) {
      fetch('/api/prisma/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          ipAddress: ipAddress,
        }),
      })
        .then(async (response: Response) => {
          if (response.ok) {
            // Status 200-299
            return response.json();
          } else {
            // Status outside of 200-299
            throw response;
          }
        })
        .then(async (data: { id: string }) => {
          // handle the response when it is ok

          await onSubmit({
            email,
            password: email,
          });

          //Fire off login request
        })
        .catch((errorResponse: Response) => {
          // Handle non-200 responses here
          errorResponse.json().then(async (error: { error: string }) => {
            console.error('Error:', error.error); // Log error message from the server
            if (error.error === 'User already exists') {
              // toast({
              //   title: 'Email already exists',
              //   description: 'Please login',
              //   status: 'info',
              //   duration: 5000,
              //   isClosable: true,
              // });
              // setLoginToggled(false);
              // console.log(loginToggled);

              await onSubmit({
                email,
                password: email,
              });
            } else {
              toast({
                title: 'Authentication error',
                description: error.error,
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }
          });
        });
    }
  };

  const onSubmit = async (data: LoginData) => {
    await logIn(data)
      .then(() => {
        toast({
          title: 'Success',
          description: 'You have successfully logged in',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to home page
        router.push('/chat');
      })
      .catch((err) => {
        toast({
          title: 'Authentication error',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    if (router.isReady) {
      const d = router.query.email;
      console.log(d);
      console.log(router);
      setEmail(d);
    }
  }, [router.isReady]);

  return (
    <Card
      mb="20px"
      alignItems="center"
      minHeight="90vh"
      height="90%"
      overflow="auto"
      position="relative"
      maxHeight="100%"
      w={'100%'}
      maxWidth={'100%'}
      textAlign={'center'}
    >
      <Flex bg={banner} w="100%" h="129px" borderRadius="16px" />
      <NextAvatar
        mx="auto"
        src={glo}
        h="187px"
        w="187px"
        mt="-43px"
        mb="15px"
      />
      <Text
        fontSize="2xl"
        textColor={textColorPrimary}
        fontWeight="700"
        mb="4px"
      >
        {name}
      </Text>

      <Flex
        align="center"
        mx="auto"
        px="14px"
        mb="20px"
        display={step > 0 ? 'none' : 'flex'}
      >
        <Text
          fontSize="16px"
          textColor={textColorSecondary}
          fontWeight="500"
          my="20px"
          px="20%"
          textAlign={'center'}
          lineHeight="2"
        >
          Hey, <strong>I'm Glo!</strong> I'm here to help you save time,
          brainstorm and get "unstuck" as you build and grow your business and
          work toward another level of success in your life!
          <br />
          <br />
          Think of me as your "secret weapon"… the possibilities for how I can
          help you are truly endless. You can start a conversation, ask
          questions, and share anything and everything about YOU so we can get
          to know each other – and then I'll support you in reaching your next
          level of life and business as fast as possible.
          <br />
          <br />
          Ready to get started? Let's take the first step together!
        </Text>
      </Flex>

      <Button
        minWidth={'250px'}
        height="49px"
        background="#296FFA"
        border="1px solid var(--unnamed-color-296ffa)"
        borderRadius="12px"
        opacity="1"
        color={'white'}
        alignSelf={'center'}
        mt={'20px'}
        display={step > 0 ? 'none' : 'flex'}
        _hover={{
          opacity: 0.8,
        }}
        onClick={showTCs}
      >
        {'Start Now'}
      </Button>

      {/* ///// step 1 */}
      <Flex
        align="center"
        flexDirection={'column'}
        mx="auto"
        mt="20px"
        mb="20px"
        px="20%"
        display={step === 1 ? 'flex' : 'none'}
      >
        {loginToggled ? (
          <>
            <TermsAndConditions />
            <Button
              width="50%"
              height="49px"
              background="#296FFA"
              border="1px solid var(--unnamed-color-296ffa)"
              borderRadius="12px"
              opacity="1"
              color={'white'}
              alignSelf={'center'}
              mt={'20px'}
              _hover={{
                opacity: 0.8,
              }}
              onClick={createAccount}
            >
              {'I Agree'}
            </Button>
          </>
        ) : (
          <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
            <Heading as="h1" size="xl">
              Log In
            </Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={!!errors.email}>
                <Input
                  placeholder="Email"
                  value={email}
                  {...register('email', {
                    required: true,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'invalid email address',
                    },
                  })}
                />
              </FormControl>
              {errors.email && (
                <Text fontSize="sm" color="red.500">
                  {errors.email.message}
                </Text>
              )}

              <FormControl mt={4} isInvalid={!!errors.password}>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    {...register('password', {
                      required: true,
                    })}
                    width={'500px'}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Show password"
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button
                variant="primary"
                type="submit"
                mt={6}
                w={100}
                padding={'20px 50px'}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </form>
          </VStack>
        )}
      </Flex>
    </Card>
  );
};

export default LoginPage;
