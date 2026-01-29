import React, { useState } from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { isSameUser, Message } from '../config/ChatLogics'
import { ChatState } from './../Context/ChatProvider';
import { Avatar, Tooltip, Box, Text, Flex, VStack } from '@chakra-ui/react';
import MessageContextMenu from './Miscellaneous/MessageContextMenu';
import ReplyMessage from './Miscellaneous/ReplyMessage';

interface ScrollableChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ScrollableChat: React.FC<ScrollableChatProps> = ({ messages, setMessages }) => {
  const { user } = ChatState();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const clearReply = () => {
    setReplyingTo(null);
  };

  return (
    <Box 
      position="relative" 
      w="100%" 
      h="100%" 
      overflowX="hidden" 
    >
      {replyingTo && (
        <ReplyMessage message={replyingTo} onClose={clearReply} />
      )}
      
      <ScrollableFeed>
        {messages && messages.map((m, i) => {
          const isMe = m.sender._id === user._id;
          const isFirstInGroup = i === 0 || messages[i - 1].sender._id !== m.sender._id;

          return (
            <Box
              key={m._id}
              w="100%" 
              display="flex"
              justifyContent={isMe ? 'flex-end' : 'flex-start'}
              px={{ base: 2, md: 4 }} 
              mb={isSameUser(messages, m, i) ? 1 : 3}
              position="relative"
              className="message-container"
            >
              {!isMe && (
                <Box w="32px" mr={2} flexShrink={0}> 
                  {isFirstInGroup ? (
                    <Tooltip label={m.sender.name} placement='bottom-start' hasArrow>
                      <Avatar
                        size='xs'
                        cursor='pointer'
                        name={m.sender.name}
                        src={m.sender.pic}
                      />
                    </Tooltip>
                  ) : null}
                </Box>
              )}

              <VStack align={isMe ? 'flex-end' : 'flex-start'} spacing={0} maxW="80%">
                {!isMe && isFirstInGroup && (
                  <Text 
                    fontSize='xs' 
                    fontWeight='bold' 
                    color='teal.600' 
                    ml={1} 
                    mb={1}
                  >
                    {m.sender.name}
                  </Text>
                )}

                <Box
                  bg={isMe ? '#dcf8c6' : 'white'} 
                  color='gray.800'
                  borderRadius={isMe 
                      ? '10px 0px 10px 10px' 
                      : '0px 10px 10px 10px' 
                  }
                  p='6px 12px'
                  boxShadow='sm'
                  wordBreak='break-word' 
                  position="relative"
                  w="fit-content" 
                >
                  <Flex alignItems="flex-start" gap={2}>
                    <VStack align="stretch" spacing={1} flex={1}>
                      {m.replyTo && (
                        <Box
                          bg="blackAlpha.100" 
                          borderLeft="3px solid"
                          borderColor="blue.400"
                          borderRadius="sm"
                          p={2}
                          mb={1}
                          maxW="100%"
                        >
                          <Text fontSize="10px" fontWeight="700" color="blue.600">
                            {m.replyTo.sender.name}
                          </Text>
                          <Text fontSize="xs" color="gray.700" noOfLines={1}>
                            {m.replyTo.content}
                          </Text>
                        </Box>
                      )}
                      
                      <Text fontSize="14px" lineHeight="short">
                        {m.content}
                      </Text>
                      
                      <Text 
                        fontSize="9px" 
                        textAlign="right" 
                        color="gray.500" 
                        mt={1}
                        userSelect="none"
                      >
                        12:00 PM
                      </Text>
                    </VStack>
                    
                    <Box ml={1}>
                        <MessageContextMenu 
                          message={m} 
                          messages={messages} 
                          setMessages={setMessages}
                          onReply={handleReply}
                        />
                    </Box>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          );
        })}
      </ScrollableFeed>
    </Box>
  )
}

export default ScrollableChat;