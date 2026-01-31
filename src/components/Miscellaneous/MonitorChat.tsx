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
  Tooltip,
  VStack,
  HStack,
  Badge
} from '@chakra-ui/react';
import { CloseIcon, ChatIcon, AddIcon } from '@chakra-ui/icons';
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
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isUploading?: boolean;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: User;
}

interface MonitorChatProps {
  selectedChat: Chat | null;
  onClose: () => void;
}

const MonitorChat: React.FC<MonitorChatProps> = ({ selectedChat, onClose }) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const toast = useToast();

  const fetchChatMessages = async () => {
    if (!selectedChat) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`
        }
      };
      
      const { data } = await axios.get<Message[]>(`/api/message/${selectedChat._id}`, config);
      setChatMessages(data);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Error fetching messages',
        status: 'error',
        duration: 5000,
        position: 'bottom'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages();
    }
  }, [selectedChat]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderName = (sender: User, chat: Chat) => {
    if (chat.isGroupChat) {
      return sender.name;
    } else {
      const otherUser = chat.users.find(user => user._id !== sender._id);
      return otherUser ? otherUser.name : sender.name;
    }
  };

  if (!selectedChat) return null;

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Flex bg="white" p={3} borderRadius="lg" shadow="sm" align="center" mb={4} justify="space-between">
        <HStack>
          <Avatar size="sm" name={selectedChat.isGroupChat ? selectedChat.chatName : selectedChat.users.map(u => u.name).join(', ')} />
          <Box>
            <Heading size="xs">
              {selectedChat.isGroupChat ? selectedChat.chatName : selectedChat.users.map(u => u.name).join(' & ')}
            </Heading>
            <Text fontSize="10px" color="gray.500">
              {selectedChat.isGroupChat ? (
                <>
                  Group • {selectedChat.users.length} members
                  {selectedChat.groupAdmin && (
                    <Badge ml={2} colorScheme="purple" variant="subtle" size="xs">
                      Admin: {selectedChat.groupAdmin.name}
                    </Badge>
                  )}
                </>
              ) : (
                'Personal Chat'
              )}
            </Text>
          </Box>
        </HStack>
        <Button size="xs" colorScheme="red" variant="ghost" onClick={onClose}>Close</Button>
      </Flex>

      <Box flex={1} overflowY="auto" p={4} bgImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" bgRepeat="repeat" borderRadius="lg">
        {loading ? (
          <VStack spacing={4} align="stretch">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="60px" borderRadius="lg" />
            ))}
          </VStack>
        ) : chatMessages.length > 0 ? (
          <>
            {chatMessages.map((msg) => {
              if (!msg.sender) return null;
              
              return (
                <Flex key={msg._id} justify={msg.sender._id === JSON.parse(localStorage.getItem('adminInfo') || '{}')._id ? "flex-end" : "flex-start"} mb={3}>
                  <Box
                    maxW="75%"
                    bg={msg.sender._id === JSON.parse(localStorage.getItem('adminInfo') || '{}')._id ? "#dcf8c6" : "white"}
                    p={2}
                    px={3}
                    borderRadius="lg"
                    boxShadow="sm"
                    position="relative"
                  >
                    {selectedChat.isGroupChat && (
                      <Text fontSize="xs" fontWeight="bold" color="teal.600" mb={1}>
                        {msg.sender.name}
                      </Text>
                    )}

                    {msg.isUploading ? (
                      <Box bg="gray.100" p={3} borderRadius="lg" mb={2}>
                        <Flex align="center" gap={3}>
                          <Box>
                            <Text fontSize="sm" fontWeight="500">Uploading {msg.fileName || 'file'}...</Text>
                            <Text fontSize="xs" color="gray.500">Please wait</Text>
                          </Box>
                        </Flex>
                      </Box>
                    ) : msg.fileUrl ? (
                      <Box mb={2}>
                        {msg.fileType?.startsWith('image/') ? (
                          <Box borderRadius="md" overflow="hidden" mb={2}>
                            <img 
                              src={msg.fileUrl} 
                              alt={msg.fileName} 
                              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/200x200?text=Image+Error';
                              }}
                            />
                          </Box>
                        ) : msg.fileType?.startsWith('video/') ? (
                          <Box borderRadius="md" overflow="hidden" mb={2}>
                            <video 
                              src={msg.fileUrl} 
                              controls 
                              style={{ maxWidth: '200px', maxHeight: '200px' }}
                            />
                          </Box>
                        ) : (
                          <Box bg="gray.50" p={3} borderRadius="md" mb={2}>
                            <Flex align="center" gap={3}>
                              <Box bg="blue.100" p={2} borderRadius="full">
                                <Text fontSize="lg">📁</Text>
                              </Box>
                              <Box flex={1}>
                                <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                                  {msg.fileName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {msg.fileType?.split('/')[1] || 'File'}
                                </Text>
                              </Box>
                            </Flex>
                          </Box>
                        )}
                        {msg.content && <Text fontSize="sm" mb={1}>{msg.content}</Text>}
                      </Box>
                    ) : (
                      <Text fontSize="sm" mb={1}>{msg.content}</Text>
                    )}

                    <Text fontSize="9px" color="gray.500" textAlign="right">
                      {formatTime(msg.createdAt)}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </>
        ) : (
          <Flex align="center" justify="center" h="100%" color="gray.400">
            <Text>No messages in this conversation</Text>
          </Flex>
        )}
      </Box>
      
      <Box p={3} bg="white" borderRadius="lg" mt={2} textAlign="center">
        <Text fontSize="xs" color="orange.500" fontWeight="bold">
          MONITORING MODE - Admin cannot send messages
        </Text>
        <Text fontSize="xs" color="gray.500">Admin can only view conversations</Text>
      </Box>
    </Box>
  );
};

export default MonitorChat;