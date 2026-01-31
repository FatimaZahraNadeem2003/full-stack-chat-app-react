import React, { useEffect, useState } from 'react'
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal
} from '@chakra-ui/react'
import {
  AddIcon,
  HamburgerIcon,
  DeleteIcon,
  SmallCloseIcon
} from '@chakra-ui/icons'
import axios from 'axios'
import { ChatState } from '../Context/ChatProvider'
import ChatLoading from './ChatLoading'
import { getSender } from '../config/ChatLogics'
import GroupChatModal from './Miscellaneous/GroupChatModal'


interface User {
  _id: string
  name: string
  email: string
  pic: string
  token?: string
}

interface Message {
  _id: string
  sender: User
  content: string
  isRead?: boolean
}

interface Chat {
  _id: string
  isGroupChat: boolean
  chatName: string
  users: User[]
  latestMessage?: Message
  isBlocked?: boolean
  blockedBy?: (string | { _id: string })[]
}

interface MyChatsProps {
  fetchAgain: boolean
}


const MyChats: React.FC<MyChatsProps> = ({ fetchAgain }) => {
  const [showChats, setShowChats] = useState(true)

  const { user, selectedChat, setSelectedChat, chats, setChats } =
    ChatState()

  const toast = useToast()


  const fetchChats = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      }
      const { data } = await axios.get<Chat[]>('/api/chat', config)
      const chatsWithBlockStatus = data.map(chat => ({
        ...chat,
        isBlocked: chat.blockedBy && chat.blockedBy.some(blockedUserId => {
          if (typeof blockedUserId === 'string') {
            return blockedUserId === user?._id;
          } else {
            return (blockedUserId as any)?._id === user?._id;
          }
        })
      }))
      setChats(chatsWithBlockStatus)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load chats',
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    }
  }

  useEffect(() => {
    fetchChats()
  }, [fetchAgain])


  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log('Deleting chat:', chatId)
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      }

      const response = await axios.delete(`/api/chat/${chatId}`, config)
      console.log('Delete response:', response.data)

      setChats(chats.filter((c: Chat) => c._id !== chatId))

      if (
        typeof selectedChat !== 'string' &&
        selectedChat?._id === chatId
      ) {
        setSelectedChat('')
      }

      toast({
        title: 'Chat deleted',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleBlockChat = async (chatId: string) => {
    try {
      console.log('Blocking chat:', chatId)
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      }

      const response = await axios.post(`/api/chat/${chatId}/block`, {}, config)
      console.log('Block response:', response.data)

      setChats(chats.map((c: Chat) => 
        c._id === chatId ? { ...c, isBlocked: true } : c
      ))

      toast({
        title: 'Chat blocked',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error: any) {
      console.error('Block error:', error)
      toast({
        title: 'Block failed',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const handleUnblockChat = async (chatId: string) => {
    try {
      console.log('Unblocking chat:', chatId)
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      }

      const response = await axios.post(`/api/chat/${chatId}/unblock`, {}, config)
      console.log('Unblock response:', response.data)

      setChats(chats.map((c: Chat) => 
        c._id === chatId ? { ...c, isBlocked: false } : c
      ))

      toast({
        title: 'Chat unblocked',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error: any) {
      console.error('Unblock error:', error)
      toast({
        title: 'Unblock failed',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }


  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      p={3}
      w={{ base: '100%', md: '32%' }}
      h="100%"
      overflow="hidden"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Flex align="center" gap={2}>
          <IconButton
            size="sm"
            variant="ghost"
            icon={<HamburgerIcon />}
            aria-label="toggle chats"
            onClick={() => setShowChats(!showChats)}
          />
          <Text fontSize="2xl" fontWeight="bold">
            My Chats
          </Text>
        </Flex>

        <GroupChatModal>
          <Button size="sm" colorScheme="teal" rightIcon={<AddIcon />}>
            New Group
          </Button>
        </GroupChatModal>
      </Flex>

      <Divider />

      <Collapse in={showChats} style={{ flex: 1, overflow: 'hidden' }}>
        <Box mt={3} overflowY="auto">
          {chats ? (
            <Stack spacing={2}>
              {chats.map((chat: Chat) => {
                const isSelected =
                  typeof selectedChat !== 'string' &&
                  selectedChat?._id === chat._id

                return (
                  <Flex
                    key={chat._id}
                    p={3}
                    align="center"
                    justify="space-between"
                    bg={isSelected ? 'teal.500' : 'white'}
                    color={isSelected ? 'white' : 'gray.800'}
                    borderRadius="xl"
                  >
                    <Flex
                      align="center"
                      gap={3}
                      flex="1"
                      cursor="pointer"
                      onClick={() => setSelectedChat(chat)}
                    >
                      <Avatar
                        size="sm"
                        name={
                          chat.isGroupChat
                            ? chat.chatName
                            : getSender(user, chat.users)
                        }
                      />

                      <Box>
                        <Text fontWeight="600" noOfLines={1}>
                          {chat.isGroupChat
                            ? chat.chatName
                            : getSender(user, chat.users)}
                        </Text>

                        {chat.latestMessage && (
                          <Text fontSize="xs" noOfLines={1}>
                            {chat.latestMessage.content}
                          </Text>
                        )}
                      </Box>
                    </Flex>

                    <Box onClick={(e) => e.stopPropagation()}>
                      <Menu placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          icon={<HamburgerIcon />}
                          size="sm"
                          variant="ghost"
                        />

                        <Portal>
                          <MenuList zIndex="2000">
                            <MenuItem
                              icon={<DeleteIcon />}
                              color="red.500"
                              onClick={() =>
                                handleDeleteChat(chat._id)
                              }
                            >
                              Delete Chat
                            </MenuItem>

                            {chat.isBlocked ? (
                              <MenuItem
                                icon={<SmallCloseIcon />}
                                color="green.500"
                                onClick={() =>
                                  handleUnblockChat(chat._id)
                                }
                              >
                                Unblock Chat
                              </MenuItem>
                            ) : (
                              <MenuItem
                                icon={<SmallCloseIcon />}
                                color="orange.500"
                                onClick={() =>
                                  handleBlockChat(chat._id)
                                }
                              >
                                Block Chat
                              </MenuItem>
                            )}
                          </MenuList>
                        </Portal>
                      </Menu>
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
