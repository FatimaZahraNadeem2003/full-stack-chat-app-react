import React from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { ChatState } from '../../Context/ChatProvider';
import { Box, Text, Flex, Avatar, Tooltip } from '@chakra-ui/react';

const ScrollableChat = ({ messages }: any) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages && messages.map((m: any, i: number) => (
        <Flex key={m._id} w="100%" mt={2} justify={m.sender._id === user?._id ? "flex-end" : "flex-start"}>
          {(m.sender._id !== user?._id) && (
            <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
              <Avatar size="xs" name={m.sender.name} src={m.sender.pic} mr={1} mt="10px" />
            </Tooltip>
          )}
          <Box
            maxW="75%"
            bg={m.sender._id === user?._id ? "#dcf8c6" : "white"}
            color="black"
            borderRadius="12px"
            p="8px 12px"
            boxShadow="sm"
            position="relative"
          >
            <Text fontSize="15px">{m.content}</Text>
            <Text fontSize="9px" textAlign="right" color="gray.500" mt={1}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Box>
        </Flex>
      ))}
    </ScrollableFeed>
  )
}

export default ScrollableChat;