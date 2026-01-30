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
  Skeleton,
  SkeletonText,
  Divider,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { CloseIcon, ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';

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
}

const getSender = (loggedUser: User | null, users: User[]): string => {
  if (!users || users.length < 2) return "Unknown User";
  
  const otherUser = users[0]?._id === loggedUser?._id ? users[1] : users[0];
  return otherUser?.name || "Unknown User";
};

interface UserChatViewerProps {
  selectedUser: User | null;
  onClose: () => void;
}

const UserChatViewer: React.FC<UserChatViewerProps> = ({ selectedUser, onClose }) => {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const toast = useToast();

  const fetchUserChats = async () => {
    if (!selectedUser) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.get<Chat[]>('/api/admin/chats', config);
      
      const userChatList = data.filter(chat => 
        chat.users.some(user => user._id === selectedUser._id)
      );
      
      setUserChats(userChatList);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Error fetching user chats',
        description: error.response?.data?.message || 'Failed to load chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };

      const { data } = await axios.get<Message[]>(`/api/message/${chatId}`, config);
      setChatMessages(data);
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

  useEffect(() => {
    if (selectedUser) {
      fetchUserChats();
    }
  }, [selectedUser]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat._id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!selectedUser) return null;

  return (
    <Flex h="100vh" position="relative" p={0}> 
      <Box w="300px" borderRight="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">User Chats</Heading>
          <Tooltip label="Close">
            <IconButton 
              aria-label="Close" 
              icon={<CloseIcon />} 
              size="sm" 
              onClick={onClose}
            />
          </Tooltip>
        </Flex>
        
        <Divider mb={4} />
        
        <Flex align="center" mb={4} p={3} bg="gray.50" borderRadius="lg">
          <Avatar size="sm" src={selectedUser.pic} mr={3} />
          <Box>
            <Text fontWeight="bold">{selectedUser.name}</Text>
            <Text fontSize="sm" color="gray.600">{selectedUser.email}</Text>
          </Box>
        </Flex>

        {loading ? (
          <Box>
            {[1, 2, 3].map(i => (
              <Card key={i} mb={3}>
                <CardBody>
                  <Skeleton height="20px" mb={2} />
                  <SkeletonText mt="4" noOfLines={2} spacing="4" />
                </CardBody>
              </Card>
            ))}
          </Box>
        ) : userChats.length > 0 ? (
          <Box overflowY="auto" maxH="calc(100vh - 250px)">
            {userChats.map(chat => {
              if (!chat) return null;
              
              return (
                <Card 
                  key={chat._id} 
                  mb={3}
                  cursor="pointer"
                  onClick={() => handleChatSelect(chat)}
                  bg={selectedChat?._id === chat._id ? "teal.50" : "white"}
                  border={selectedChat?._id === chat._id ? "2px solid" : "1px solid"}
                  borderColor={selectedChat?._id === chat._id ? "teal.400" : "gray.200"}
                  _hover={{ 
                    bg: selectedChat?._id === chat._id ? "teal.50" : "gray.50",
                    transform: "translateY(-1px)"
                  }}
                >
                  <CardBody p={3}>
                    <Text fontWeight="bold" mb={1} fontSize="sm">
                      {chat.isGroupChat ? chat.chatName : getSender(selectedUser, chat.users)}
                    </Text>
                    {chat.latestMessage ? (
                      <Box>
                        <Text fontSize="xs" color="gray.600">
                          {chat.latestMessage.sender?.name || 'Unknown User'}: {chat.latestMessage.content}
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
          </Box>
        ) : (
          <Text color="gray.500" textAlign="center" mt={8}>
            No chats found for this user
          </Text>
        )}
      </Box>

      <Box flex={1} p={4}>
        {selectedChat ? (
          <Box h="100%" display="flex" flexDirection="column">
            <Card mb={4}>
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="md" mb={1}>
                      {selectedChat.isGroupChat ? selectedChat.chatName : getSender(selectedUser, selectedChat.users)}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {selectedChat.users.length} participants
                    </Text>
                  </Box>
                  <Button 
                    colorScheme="red" 
                    size="sm" 
                    leftIcon={<CloseIcon />}
                    onClick={() => setSelectedChat(null)}
                  >
                    Close Chat
                  </Button>
                </Flex>
              </CardBody>
            </Card>

            <Card flex={1} overflow="hidden">
              <CardBody p={0} display="flex" flexDirection="column" h="100%">
                <Box flex={1} overflowY="auto" p={4}>
                  {chatMessages.length > 0 ? (
                    <Box>
                      {chatMessages.map((msg) => {
                        if (!msg.sender) return null;
                        
                        return (
                          <Box 
                            key={msg._id} 
                            mb={4}
                            display="flex"
                            justifyContent={msg.sender._id === selectedUser._id ? "flex-end" : "flex-start"}
                          >
                            <Box
                              maxW="70%"
                              bg={msg.sender._id === selectedUser._id ? "teal.100" : "gray.100"}
                              p={3}
                              borderRadius={msg.sender._id === selectedUser._id ? "10px 10px 0 10px" : "10px 10px 10px 0"}
                            >
                              <Flex align="center" mb={1}>
                                <Avatar size="xs" src={msg.sender.pic} mr={2} />
                                <Text fontSize="sm" fontWeight="bold">
                                  {msg.sender.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500" ml={2}>
                                  {formatDate(msg.createdAt)}
                                </Text>
                              </Flex>
                              <Text fontSize="sm">{msg.content}</Text>
                            </Box>
                          </Box>
                        );
                      }).filter(Boolean)} 
                    </Box>
                  ) : (
                    <Text color="gray.500" textAlign="center" mt={8}>
                      No messages in this chat
                    </Text>
                  )}
                </Box>
                
                <Box p={4} borderTop="1px" borderColor="gray.200" bg="gray.50">
                  <Text textAlign="center" color="gray.600" fontStyle="italic">
                    🔒 Read-only mode - Admin can only view messages
                  </Text>
                </Box>
              </CardBody>
            </Card>
          </Box>
        ) : (
          <Flex align="center" justify="center" h="100%">
            <Box textAlign="center">
              <ChatIcon boxSize={12} color="gray.300" mb={4} />
              <Text color="gray.500" fontSize="lg">
                Select a chat to view messages
              </Text>
              <Text color="gray.400" fontSize="sm">
                Admin can view all user conversations but cannot participate
              </Text>
            </Box>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default UserChatViewer;