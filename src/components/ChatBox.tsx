import React from 'react'
import { ChatState } from './../Context/ChatProvider'
import { Box } from '@chakra-ui/react'
import SingleChat from './SingleChat'

interface ChatBoxProps {
  fetchAgain: boolean
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatBox: React.FC<ChatBoxProps> = ({
  fetchAgain,
  setFetchAgain,
}) => {
  const { selectedChat } = ChatState()

  return (
    <Box
      display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
      flexDir="column"
      flex={{ base: "none", md: "1" }} 
      w={{ base: '100%', md: 'auto' }}
      h="100%"                 
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(12px)"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="lg"
      overflow="hidden" 
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  )
}

export default ChatBox