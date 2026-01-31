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
  HStack 
} from '@chakra-ui/react';
import { CloseIcon, ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';
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
  replyTo?: Message; 
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
        status: 'error',
        duration: 5000,
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
      const { data } = await axios.get<Message[]>(`/api/admin/chat/${chatId}/messages`, config);
      setChatMessages(data);
    } catch (error: any) {
      toast({ title: 'Error fetching messages', status: 'error' });
    }
  };

  useEffect(() => {
    if (selectedUser) fetchUserChats();
  }, [selectedUser]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat._id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedUser) return null;

  return (
    <Flex h="100vh" position="relative" p={0} bg="#F0F2F5"> 
      <Box w="350px" borderRight="1px" borderColor="gray.200" p={4} bg="white">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="teal.700">User Chats</Heading>
          <IconButton aria-label="Close" icon={<CloseIcon />} size="sm" onClick={onClose} variant="ghost"/>
        </Flex>
        <Divider mb={4} />
        <Flex align="center" mb={4} p={3} bg="teal.50" borderRadius="lg">
          <Avatar size="sm" src={selectedUser.pic} mr={3} />
          <Box>
            <Text fontWeight="bold" fontSize="sm">{selectedUser.name}</Text>
            <Text fontSize="xs" color="gray.600">{selectedUser.email}</Text>
          </Box>
        </Flex>

        {loading ? (
          <VStack align="stretch">
            {[1, 2, 3].map(i => <Skeleton key={i} height="70px" borderRadius="lg" />)}
          </VStack>
        ) : (
          <Box overflowY="auto" maxH="calc(100vh - 250px)">
            {userChats.map(chat => (
              <Card 
                key={chat._id} mb={2} cursor="pointer" onClick={() => handleChatSelect(chat)}
                bg={selectedChat?._id === chat._id ? "teal.50" : "white"}
                variant="outline" borderColor={selectedChat?._id === chat._id ? "teal.400" : "gray.100"}
              >
                <CardBody p={3}>
                  <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                    {chat.isGroupChat ? chat.chatName : getSender(selectedUser, chat.users)}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {chat.latestMessage?.content || 'No messages'}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Box flex={1} p={4} display="flex" flexDirection="column">
        {selectedChat ? (
          <MonitorChat selectedChat={selectedChat} onClose={() => setSelectedChat(null)} />
        ) : (
          <Flex align="center" justify="center" h="100%" flexDir="column" color="gray.400">
            <ChatIcon boxSize={12} mb={4} />
            <Text fontSize="lg">Select a conversation to monitor</Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default UserChatViewer;