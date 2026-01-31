import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  CardBody,
  Avatar,
  Button,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  SkeletonText,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { CloseIcon, ChatIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import io from 'socket.io-client';
import MonitorChat from './MonitorChat';

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: string;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: User;
}

interface AdminChatProps {
  onClose: () => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState<string[]>([]);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.get<User[]>('/api/admin/users', config);
      const validUsers = data.filter(user => user && user._id && user.name);
      setUsers(validUsers);
    } catch (error: any) {
      toast({
        title: 'Error fetching users',
        description: error.response?.data?.message || 'Failed to load users',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.get<Chat[]>('/api/admin/chats', config);
      const validChats = data.filter(chat => chat && chat._id);
      setChats(validChats);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Error fetching chats',
        description: error.response?.data?.message || 'Failed to load chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.get<Message[]>(`/api/message/${chatId}`, config);
      setMessages(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching messages',
        description: error.response?.data?.message || 'Failed to load messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.post<Message>('/api/message', {
        content: newMessage,
        chatId: selectedChat._id
      }, config);

      setMessages([...messages, data]);
      setNewMessage('');
      
      fetchChats();
      
      if (socket) {
        socket.emit('new message', data);
      }
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.response?.data?.message || 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  const accessChat = async (userId: string) => {
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.post<Chat>('/api/chat', { userId }, config);
      if (data) {
        setSelectedChat(data);
        fetchMessages(data._id);
        fetchChats();
      }
    } catch (error: any) {
      toast({
        title: 'Error accessing chat',
        description: error.response?.data?.message || 'Failed to access chat',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchChats();
    
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message recieved', (newMessageRecieved: Message) => {
        if (selectedChat && selectedChat._id === newMessageRecieved.chat._id) {
          setMessages(prev => [...prev, newMessageRecieved]);
        }
        fetchChats();
      });
    }

    return () => {
      if (socket) {
        socket.off('message recieved');
      }
    };
  }, [socket, selectedChat]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsersForGroup(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const createGroupChat = async () => {
    if (groupName.trim() === '' || selectedUsersForGroup.length < 2) {
      toast({
        title: 'Error',
        description: 'Please enter a group name and select at least 2 users',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      return;
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.post<Chat>('/api/chat/group', {
        name: groupName,
        users: JSON.stringify(selectedUsersForGroup)
      }, config);

      if (data) {
        toast({
          title: 'Group created',
          description: 'Group created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
        setCreatingGroup(false);
        setGroupName('');
        setSelectedUsersForGroup([]);
        fetchChats();
      }
    } catch (error: any) {
      toast({
        title: 'Error creating group',
        description: error.response?.data?.message || 'Failed to create group',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  return (
    <Flex h="100vh" position="relative" p={0}>
      <Box w="300px" borderRight="1px" borderColor="gray.200" display="flex" flexDirection="column">
        <Flex justify="space-between" align="center" p={4} bg="white">
          <Heading size="md">Admin Chat</Heading>
          <Tooltip label="Close">
            <IconButton 
              aria-label="Close" 
              icon={<CloseIcon />} 
              size="sm" 
              onClick={onClose}
            />
          </Tooltip>
        </Flex>
        
        <Divider />
        
        <Box p={4} flex="1" overflowY="auto">
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm">Users</Heading>
            <Button 
              size="xs" 
              colorScheme="teal" 
              leftIcon={<AddIcon />} 
              onClick={() => setCreatingGroup(true)}
            >
              Create Group
            </Button>
          </Flex>
          
          {creatingGroup ? (
            <Box mb={4}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                mb={3}
              />
              <Text fontSize="sm" fontWeight="bold" mb={2}>Select Users:</Text>
              {users.filter(user => user._id !== JSON.parse(localStorage.getItem('adminInfo') || '{}')._id).map(user => (
                <Card 
                  key={user._id} 
                  mb={2}
                  cursor="pointer"
                  onClick={() => toggleUserSelection(user._id)}
                  bg={selectedUsersForGroup.includes(user._id) ? "teal.50" : "white"}
                  border={selectedUsersForGroup.includes(user._id) ? "2px solid teal" : "1px solid gray"}
                >
                  <CardBody p={3}>
                    <Flex align="center">
                      <Avatar size="sm" src={user.pic} mr={3} />
                      <Box>
                        <Text fontWeight="medium">{user.name}</Text>
                        <Text fontSize="sm" color="gray.600">{user.email}</Text>
                      </Box>
                      <Badge 
                        ml="auto" 
                        colorScheme={selectedUsersForGroup.includes(user._id) ? "teal" : "gray"}
                      >
                        {selectedUsersForGroup.includes(user._id) ? "Selected" : "Select"}
                      </Badge>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
              <Flex mt={3} gap={2}>
                <Button 
                  size="sm" 
                  colorScheme="teal" 
                  onClick={createGroupChat}
                  isDisabled={selectedUsersForGroup.length < 2}
                >
                  Create Group
                </Button>
                <Button 
                  size="sm" 
                  colorScheme="gray" 
                  onClick={() => {
                    setCreatingGroup(false);
                    setGroupName('');
                    setSelectedUsersForGroup([]);
                  }}
                >
                  Cancel
                </Button>
              </Flex>
            </Box>
          ) : (
            users && users.length > 0 ? (
              users.map(user => {
                if (!user || !user._id) return null;
                
                return (
                  <Card 
                    key={user._id} 
                    mb={2}
                    cursor="pointer"
                    onClick={() => accessChat(user._id)}
                    _hover={{ bg: "gray.50" }}
                  >
                    <CardBody p={3}>
                      <Flex align="center">
                        <Avatar size="sm" src={user.pic} mr={3} />
                        <Box>
                          <Text fontWeight="medium">{user.name}</Text>
                          <Text fontSize="sm" color="gray.600">{user.email}</Text>
                        </Box>
                      </Flex>
                    </CardBody>
                  </Card>
                );
              }).filter(Boolean)
            ) : (
              <Text color="gray.500" textAlign="center" mt={4}>
                No users available
              </Text>
            )
          )}
        </Box>
        
        <Divider />
        
        <Box p={4} flex="1" overflowY="auto">
          <Heading size="sm" mb={3}>Chats</Heading>
          {loading ? (
            <Box>
              {[1, 2, 3].map(i => (
                <Card key={i} mb={2}>
                  <CardBody>
                    <Skeleton height="20px" mb={2} />
                    <SkeletonText mt="4" noOfLines={1} spacing="4" />
                  </CardBody>
                </Card>
              ))}
            </Box>
          ) : chats && chats.length > 0 ? (
            <>
              {chats.map(chat => {
                if (!chat || !chat._id) return null;
                
                return (
                  <Card 
                    key={chat._id} 
                    mb={2}
                    cursor="pointer"
                    onClick={() => {
                      setSelectedChat(chat);
                      fetchMessages(chat._id);
                    }}
                    bg={selectedChat?._id === chat._id ? "teal.50" : "white"}
                    border={selectedChat?._id === chat._id ? "2px solid" : "1px solid"}
                    borderColor={selectedChat?._id === chat._id ? "teal.400" : "gray.200"}
                  >
                    <CardBody p={3}>
                      <Text fontWeight="bold" mb={1} fontSize="sm">
                        {chat.isGroupChat ? chat.chatName : chat.users?.[0]?.name || 'Unknown User'}
                      </Text>
                      {chat.latestMessage ? (
                        <Box>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {chat.latestMessage.content}
                          </Text>
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {formatDate(chat.latestMessage.createdAt)}
                          </Text>
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">No messages</Text>
                      )}
                    </CardBody>
                  </Card>
                );
              }).filter(Boolean)}
            </>
          ) : (
            <Text color="gray.500" textAlign="center" mt={4}>
              No chats available
            </Text>
          )}
        </Box>
      </Box>

      <Box flex={1} display="flex" flexDirection="column">
        {selectedChat ? (
          <MonitorChat selectedChat={selectedChat} onClose={() => setSelectedChat(null)} />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <Box textAlign="center">
              <ChatIcon boxSize={12} color="gray.300" mb={4} />
              <Text color="gray.500" fontSize="lg">
                Select a user or chat to start messaging
              </Text>
              <Text color="gray.400" fontSize="sm">
                Admin can chat with users and participate in group conversations
              </Text>
            </Box>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default AdminChat;