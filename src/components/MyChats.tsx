import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import {
  Box,
  Button,
  Stack,
  Text,
  useToast,
  Flex,
  Avatar,
  Divider,
  IconButton,
  Collapse,
} from '@chakra-ui/react'
import axios from 'axios'
import { AddIcon, HamburgerIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading'
import { getSender } from '../config/ChatLogics'
import GroupChatModal from './Miscellaneous/GroupChatModal'

interface MyChatsProps {
  fetchAgain: boolean
}

interface User {
  _id: string
  name: string
  email: string
  pic: string
  token: string
}

interface Chat {
  _id: string
  isGroupChat: boolean
  chatName: string
  users: User[]
}

const MyChats: React.FC<MyChatsProps> = ({ fetchAgain }) => {
  const [showChats, setShowChats] = useState(true)
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState()
  const toast = useToast()

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(user as User).token}`,
        },
      }

      const { data } = await axios.get<Chat[]>('/api/chat', config)
      setChats(data)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to load the chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      })
    }
  }

  useEffect(() => {
    fetchChats()
  }, [fetchAgain, user])

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      p={3}
      bg="rgba(255,255,255,0.1)"
      backdropFilter="blur(12px)"
      w={{ base: '100%', md: '32%' }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="xl"
      h="100vh"              
    >
      <Flex align="center" justify="space-between" px={2} pb={3}>
        <Flex align="center" gap={2}>
          <IconButton
            aria-label="Toggle chats"
            icon={<HamburgerIcon />}
            size="sm"
            variant="ghost"
            onClick={() => setShowChats(!showChats)}
          />

          <Text
            fontSize="2xl"
            fontWeight="700"
            bgGradient="linear(to-r, teal.400, blue.500)"
            bgClip="text"
          >
            My Chats
          </Text>
        </Flex>

        <GroupChatModal>
          <Button
            size="sm"
            colorScheme="teal"
            rightIcon={<AddIcon />}
            borderRadius="full"
            _hover={{ transform: 'scale(1.05)', boxShadow: 'md' }}
          >
            New Group
          </Button>
        </GroupChatModal>
      </Flex>

      <Divider mb={2} />

      <Collapse in={showChats} animateOpacity style={{ height: '100%' }}>
        <Box
          flex="1"
          bg="rgba(255,255,255,0.15)"
          backdropFilter="blur(8px)"
          borderRadius="2xl"
          p={2}
          overflowY="auto"
          maxH="calc(100vh - 160px)"   
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'teal',
              borderRadius: '24px',
            },
          }}
        >
          {chats ? (
            <Stack spacing={3}>
              {chats.map((chat: Chat) => {
                const isSelected = selectedChat?._id === chat._id

                return (
                  <Flex
                    key={chat._id}
                    align="center"
                    gap={3}
                    px={3}
                    py={3}
                    borderRadius="xl"
                    cursor="pointer"
                    bg={isSelected ? 'teal.500' : 'white'}
                    color={isSelected ? 'white' : 'gray.800'}
                    boxShadow={isSelected ? 'md' : 'sm'}
                    transition="all 0.2s"
                    _hover={{
                      bg: isSelected ? 'teal.600' : 'gray.100',
                      transform: 'scale(1.02)',
                    }}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <Avatar
                      size="sm"
                      name={
                        !chat.isGroupChat
                          ? getSender(user, chat.users)
                          : chat.chatName
                      }
                      src={
                        !chat.isGroupChat
                          ? chat.users.find((u) => u._id !== user?._id)?.pic
                          : undefined
                      }
                      borderWidth={isSelected ? '2px' : '1px'}
                      borderColor={isSelected ? 'white' : 'gray.300'}
                    />

                    <Box>
                      <Text fontWeight="600">
                        {!chat.isGroupChat
                          ? getSender(user, chat.users)
                          : chat.chatName}
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        {chat.isGroupChat ? 'Group Chat' : 'Direct Message'}
                      </Text>
                    </Box>
                  </Flex>
                )
              })}
            </Stack>
          ) : (
            <ChatLoading />
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

export default MyChats
