import React, { useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box } from '@chakra-ui/react'
import SideDrawer from '../components/Miscellaneous/SideDrawer'
import MyChats from '../components/MyChats'
import ChatBox from '../components/ChatBox'

const ChatPage: React.FC = () => {
  const { user } = ChatState()
  const [fetchAgain, setFetchAgain] = useState(false)

  return (
    <Box w="100%" h="100vh" overflow="hidden">
      {user && <SideDrawer />}

      <Box
        display="flex"
        w="100%"
        h="calc(100vh - 64px)"   
        p="10px"
        gap={3}
        overflow="hidden"     
      >
        {user && <MyChats fetchAgain={fetchAgain} />}

        {user && (
          <ChatBox
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
      </Box>
    </Box>
  )
}

export default ChatPage
