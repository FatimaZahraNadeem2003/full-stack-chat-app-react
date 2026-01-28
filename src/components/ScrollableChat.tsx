import React from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser, User, Message } from '../config/ChatLogics'
import { ChatState } from './../Context/ChatProvider';
import { Avatar, Tooltip, Box } from '@chakra-ui/react';

interface ScrollableChatProps {
  messages: Message[];
}

const ScrollableChat: React.FC<ScrollableChatProps> = ({ messages }) => {

  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => (
        <Box
          key={m._id}
          display='flex'
          w='100%'
          justifyContent={m.sender._id === user._id ? 'flex-end' : 'flex-start'}
          mb={2}
        >
          {(isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
            <Tooltip label={m.sender.name} placement='bottom-start' hasArrow>
              <Avatar
                mt='7px'
                mr={2}
                size='sm'
                cursor='pointer'
                name={m.sender.name}
                src={m.sender.pic}
              />
            </Tooltip>
          )}

          <Box
            bg={m.sender._id === user._id ? 'teal.400' : 'gray.200'}
            color={m.sender._id === user._id ? 'white' : 'gray.800'}
            borderRadius='20px'
            p='8px 16px'
            maxW={{ base: '65%', md: '75%' }}
            ml={isSameSenderMargin(messages, m, i, user._id)}
            mt={isSameUser(messages, m, i) ? 1 : 3}
            boxShadow='md'
            wordBreak='break-word'
            transition='0.2s'
            _hover={{
              boxShadow: 'lg',
              transform: 'scale(1.02)'
            }}
          >
            {m.content}
          </Box>
        </Box>
      ))}
    </ScrollableFeed>
  )
}

export default ScrollableChat
