import React from 'react'
import { ChatState } from './../Context/ChatProvider';
import { Box } from '@chakra-ui/react';
import SingleChat from './SingleChat';

interface ChatBoxProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox: React.FC<ChatBoxProps> = ({fetchAgain, setFetchAgain}) => {

 const {selectedChat} = ChatState();

  return (
    <Box 
      display={{base: selectedChat ? 'flex':'none', md:'flex'}}
      alignItems='center'
      flexDir='column'
      p={4}
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(12px)"
      w={{base:'100%', md:'68%'}}
      borderRadius='2xl'
      borderWidth='1px'
      borderColor="gray.200"
      boxShadow="lg"
      minH="80vh"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "purple",
          borderRadius: "24px",
        },
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
    </Box>
  )
}

export default ChatBox
