import {createContext,useContext, useEffect, useState, ReactNode} from 'react'
import { useHistory } from 'react-router-dom';

interface ChatContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  selectedChat: any;
  setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
  chats: any[];
  setChats: React.Dispatch<React.SetStateAction<any[]>>;
  notification: any[];
  setNotification: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({children}) => {

    const [user, setUser] = useState<any>();
    const history = useHistory();
    const [selectedChat, setSelectedChat] = useState<any>();
    const [chats, setChats] = useState<any[]>([]);
    const [notification, setNotification] = useState<any[]>([])

    useEffect(()=>{
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || 'null');
      setUser(userInfo);
      console.log(userInfo);

      if(!userInfo){
        history.push("/");
      }
      
    },[history]);

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