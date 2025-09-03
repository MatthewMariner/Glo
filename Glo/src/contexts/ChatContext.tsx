import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/providers/auth/AuthProvider';

type ContextType = {
  selectedConversation: number | null;
  setSelectedConversation: (chat: number | null) => void;
  chatData: any[];
  currentResponse: string;
  setCurrentResponse: (response: string | null) => void;
  refreshChatData: (boolean?, number?) => void;
  initialScroll: boolean;
  setInitialScroll: (boolean) => void;
};

const ChatContext = createContext<ContextType>({
  selectedConversation: null,
  setSelectedConversation: (chat: number | null) => {},
  chatData: [],
  currentResponse: '',
  setCurrentResponse: (response: string | null) => {},
  refreshChatData: (isNewConversation?: boolean, conversationId?: number) => {},
  initialScroll: false,
  setInitialScroll: () => {},
});

type ChatContextProviderProps = {
  children: ReactNode;
};

const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [chatData, setChatData] = useState<any[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [initialScroll, setInitialScroll] = useState<boolean>(false);
  const { currentUser } = useAuth();

  const refreshChatData = async (
    isNewConversation?: boolean,
    conversationId?: number,
  ) => {
    let userId = currentUser?.id;
    const storedUser = localStorage.getItem('currentUser');

    if (!userId && storedUser) {
      userId = JSON.parse(storedUser).id;
    }

    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      const response = await fetch(`/api/prisma/getChatData?userId=${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch chat data: ', response.status);
        return;
      }

      const data = await response.json();
      setChatData(data);

      //We only really want to do this when its a newConversation and not on every refresh
      if (data.length > 0 && isNewConversation) {
        // console.log('isNewConversation?');
        // console.log(conversationId)
        if (conversationId) {
          setSelectedConversation(conversationId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch chat data: ', error);
    }
  };

  useEffect(() => {
    refreshChatData();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        selectedConversation,
        setSelectedConversation,
        chatData,
        refreshChatData,
        currentResponse,
        setCurrentResponse,
        initialScroll,
        setInitialScroll,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatContextProvider };

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    console.log('Context is undefined:', context);
    // throw new Error('useChatContext must be used within a ChatContextProvider');
  }
  return context;
}
