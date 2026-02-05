import React from 'react'
import { ChatState } from './../Context/ChatProvider'
import { Box } from '@chakra-ui/react'
import SingleChat from './Miscellaneous/SingleChat'

interface ChatBoxProps {
  fetchAgain: boolean
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatBox: React.FC<ChatBoxProps> = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState()

  return (
    <Box
      display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
      flexDir="column"
      flex={{ base: "none", md: "1" }} 
      w={{ base: '100%', md: 'auto' }}
      h="100%"                 
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      overflow="hidden"
      boxShadow="2xl"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  )
}

export default ChatBox