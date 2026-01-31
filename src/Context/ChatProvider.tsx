import {createContext,useContext, useEffect, useState, ReactNode} from 'react'

export interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token?: string; 
}

export interface Chat {
  _id: string;
  isGroupChat: boolean;
  users: User[];
  chatName: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  replyTo?: Message;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isUploading?: boolean;
}

interface ChatContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedChat: Chat | string | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | string | null>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  notification: any[];
  setNotification: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({children}) => {

    const [user, setUser] = useState<User | null>(null);
    const [selectedChat, setSelectedChat] = useState<Chat | string | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [notification, setNotification] = useState<any[]>([])

    useEffect(()=>{
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || 'null');
      setUser(userInfo);
      console.log(userInfo);
      
    },[]);

    useEffect(() => {
      const handleStorageChange = () => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || 'null');
        setUser(userInfo);
      };

      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    return (
       <ChatContext.Provider value={{user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification}}>
        {children}
       </ChatContext.Provider> 
    )
};

export const ChatState = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('ChatState must be used within a ChatProvider');
    }
    return context;
}

export default ChatProvider;