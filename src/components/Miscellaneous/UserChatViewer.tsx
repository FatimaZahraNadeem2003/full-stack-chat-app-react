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
      const { data } = await axios.get<Message[]>(`/api/message/${chatId}`, config);
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
          <Box h="100%" display="flex" flexDirection="column">
            <Flex bg="white" p={3} borderRadius="lg" shadow="sm" align="center" mb={4} justify="space-between">
              <HStack>
                <Avatar size="sm" name={selectedChat.isGroupChat ? selectedChat.chatName : getSender(selectedUser, selectedChat.users)} />
                <Box>
                  <Heading size="xs">{selectedChat.isGroupChat ? selectedChat.chatName : getSender(selectedUser, selectedChat.users)}</Heading>
                  <Text fontSize="10px" color="gray.500">{selectedChat.isGroupChat ? `${selectedChat.users.length} members` : 'Personal Chat'}</Text>
                </Box>
              </HStack>
              <Button size="xs" colorScheme="red" variant="ghost" onClick={() => setSelectedChat(null)}>Exit</Button>
            </Flex>

            <Box flex={1} overflowY="auto" p={4} bgImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" bgRepeat="repeat" borderRadius="lg">
              {chatMessages.map((msg) => {
                if (!msg.sender) return null;
                const isSentByTarget = msg.sender._id === selectedUser._id;
                
                return (
                  <Flex key={msg._id} justify={isSentByTarget ? "flex-end" : "flex-start"} mb={3}>
                    <Box
                      maxW="75%"
                      bg={isSentByTarget ? "#dcf8c6" : "white"}
                      p={2}
                      px={3}
                      borderRadius="lg"
                      boxShadow="sm"
                      position="relative"
                    >
                      {msg.replyTo && (
                        <Box
                          bg="rgba(0,0,0,0.05)"
                          p={2}
                          mb={2}
                          borderRadius="md"
                          borderLeft="4px solid"
                          borderColor="teal.500"
                          fontSize="xs"
                        >
                          <Text fontWeight="bold" color="teal.700" fontSize="11px">
                            {msg.replyTo.sender?.name}
                          </Text>
                          <Text noOfLines={1} color="gray.600">
                            {msg.replyTo.content}
                          </Text>
                        </Box>
                      )}

                      {selectedChat.isGroupChat && !isSentByTarget && (
                        <Text fontSize="xs" fontWeight="bold" color="purple.500" mb={1}>
                          {msg.sender.name}
                        </Text>
                      )}

                      <Box display="flex" alignItems="flex-end" flexWrap="wrap">
                        <Text fontSize="sm" mr={2} pb={1}>{msg.content}</Text>
                        <Text fontSize="9px" color="gray.500" ml="auto">
                          {formatTime(msg.createdAt)}
                        </Text>
                      </Box>
                    </Box>
                  </Flex>
                );
              })}
            </Box>
            
            <Box p={2} bg="white" borderBottomRadius="lg" textAlign="center">
              <Text fontSize="xs" color="gray.400" fontStyle="italic">Monitoring Mode</Text>
            </Box>
          </Box>
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