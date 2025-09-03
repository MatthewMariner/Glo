import { createContext, useContext, useEffect, useState } from 'react';
import { UserSession } from '../../lib/types/auth';
import {
  LoginApiResponse,
  RefreshApiResponse,
} from '../../../pages/login/login';
import { ChakraProvider, Box, Portal, useDisclosure } from '@chakra-ui/react';
import { getActiveRoute, getActiveNavbar } from '@/utils/navigation';
import theme from '@/theme/theme';
import { usePathname } from 'next/navigation';
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { ChatContextProvider } from '../../contexts/ChatContext';
import { useRouter } from 'next/router';

interface AuthContextData {
  isAuthenticated: boolean;
  currentUser: UserSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  logIn: (_data: LoginData) => Promise<void>;
  logOut: () => void;
  refreshSession: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
  currentUser: null,
  accessToken: null,
  refreshToken: null,
  logIn: () => Promise.resolve(),
  logOut: () => {},
  refreshSession: () => Promise.resolve(),
});

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    const initialKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (initialKey?.includes('sk-') && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);

  // Watch currentUser
  useEffect(() => {
    if (!currentUser) {
      // try to get user from local storage
      const user = localStorage.getItem('currentUser');
      if (user != null && user !== 'undefined') {
        const parsedUser = JSON.parse(user) as UserSession;
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
        logIn({ email: parsedUser.email, password: parsedUser.email }, true);
      }
    }
  }, [currentUser]);

  // Watch access token
  useEffect(() => {
    if (!accessToken) {
      // Read access token from cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find((cookie) => cookie.includes('token'));
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        setAccessToken(token);
      }
    }
  }, [accessToken]);

  // Watch refresh token
  useEffect(() => {
    if (!refreshToken) {
      // try to get refresh token from local storage
      const token = localStorage.getItem('refreshToken');
      if (token != null && token !== 'undefined') {
        setRefreshToken(token);
      }
    }
  }, [refreshToken]);

  const logIn = async (data: LoginData, redirect?: boolean = false) => {
    return new Promise<void>((resolve, reject) => {
      // Send data to API
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json() as Promise<LoginApiResponse>)
        .then((res) => {
          if (res.success && res.data) {
            // save access token in cookies
            document.cookie = `token=${res.data.token} secure`;

            // Save refresh token in session storage for persistence
            localStorage.setItem('refreshToken', res.data.refreshToken);

            // Save access token and refresh token
            setRefreshToken(res.data.refreshToken);

            // save user data inside state
            setCurrentUser(res.data.session);

            // save current user in local storage
            localStorage.setItem(
              'currentUser',
              JSON.stringify(res.data.session),
            );

            // set isAuthenticated to true
            setIsAuthenticated(true);

            // set auth state
            resolve();

            router.push('/chat');
          } else {
            reject(new Error(res.message));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const logOut = () => {
    // Remove access token from cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Clear provider state
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAccessToken('');
    setRefreshToken('');

    // Remove persistence data from local storage
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  };

  const refreshSession = async () => {
    // Read refresh token from localStorage if not found in provider state
    if (!refreshToken) {
      const token = localStorage.getItem('refreshToken');
      if (token != null && token !== 'undefined') {
        setRefreshToken(token);
      } else {
        return Promise.reject(new Error('Refresh token not found'));
      }
    }

    // Send API request to refresh endpoint
    if (refreshToken) {
      new Promise<void>((resolve, reject) => {
        fetch('/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })
          .then((res) => res.json() as Promise<RefreshApiResponse>)
          .then((res) => {
            if (res.success && res.data) {
              // Overwrite current token with new one
              document.cookie = `token=${res.data.token} secure`;

              // Refresh access token
              setAccessToken(res.data.token);

              // Refreshed correctly
              resolve();
            } else {
              reject(new Error(res.message));
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    } else {
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        logIn,
        logOut,
        refreshSession,
        refreshToken,
        accessToken,
      }}
    >
      {currentUser !== null ? (
        <ChatContextProvider>
          <Box>
            <Sidebar setApiKey={setApiKey} routes={routes} />
            <Box
              pt={{ base: '60px', md: '10px' }}
              float="right"
              minHeight="100vh"
              height="100%"
              overflow="hidden"
              position="relative"
              maxHeight="100%"
              w={{ base: '100%', xl: 'calc( 100% - 330px )' }}
              maxWidth={{ base: '100%', xl: 'calc( 100% - 330px )' }}
              transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
              transitionDuration=".2s, .2s, .35s"
              transitionProperty="top, bottom, width"
              transitionTimingFunction="linear, linear, ease"
              background={'#f3f5f7'}
            >
              <Portal>
                <Box>
                  <Navbar
                    setApiKey={setApiKey}
                    onOpen={onOpen}
                    logoText={'Glo'}
                    brandText={getActiveRoute(routes, pathname)}
                    secondary={getActiveNavbar(routes, pathname)}
                  />
                </Box>
              </Portal>
              <Box
                mx="auto"
                p={{ base: '20px', md: '30px' }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                {children}
              </Box>
              <Box>
                <Footer />
              </Box>
            </Box>
          </Box>
        </ChatContextProvider>
      ) : (
        <ChatContextProvider>
          <>{children}</>
        </ChatContextProvider>
      )}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  // Custom hook to use auth context
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
