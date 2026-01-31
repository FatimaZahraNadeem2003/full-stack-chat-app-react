import React, { useEffect, useState } from 'react'
import { ChatState, User, Chat, Message } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast, Flex, Avatar, InputGroup, InputRightElement } from '@chakra-ui/react';
import { ArrowBackIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from './../config/ChatLogics';
import ProfileModal from './Miscellaneous/ProfileModal';
import UpdateGroupChatModal from './Miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../animations/typing.json'

interface SingleChatProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ENDPOINT = 'http://localhost:5000';
var socket: any, selectedChatCompare: any;

const SingleChat: React.FC<SingleChatProps> = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [uploading, setUploading] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
  }

  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${(user as User).token}` } };
      const { data } = await axios.get<Message[]>(`/api/message/${(selectedChat as Chat)._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit('join chat', (selectedChat as Chat)._id);
    } catch (error: any) {
      toast({ title: 'Error Occured!', description: 'Failed to load messages', status: 'error', duration: 5000, isClosable: true, position: 'bottom' });
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, [])

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const markMessagesAsRead = async (chatId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${(user as User).token}` } };
      await axios.put(`/api/chat/${chatId}/read`, {}, config);
    } catch (error) {
      console.log('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (selectedChat && user) {
      markMessagesAsRead((selectedChat as Chat)._id);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    const handleMessageReceived = (newMessageRecieved: Message) => {
      console.log('New message received:', newMessageRecieved);
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        let notificationText;
        if (newMessageRecieved.fileUrl) {
          notificationText = `${newMessageRecieved.sender.name} has sent you a file: "${newMessageRecieved.fileName || newMessageRecieved.content}"`;
        } else {
          notificationText = `${newMessageRecieved.sender.name} has sent you a message: "${newMessageRecieved.content}"`;
        }
        
        const enhancedNotification = {
          ...newMessageRecieved,
          notificationText,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        console.log('Adding notification:', enhancedNotification);
        setNotification(prev => {
          const newNotifications = [enhancedNotification, ...prev];
          console.log('Updated notifications:', newNotifications);
          return newNotifications;
        });
        setFetchAgain(prev => !prev);
      } else {
        setMessages(prev => [...prev, newMessageRecieved]);
        markMessagesAsRead(newMessageRecieved.chat._id);
      }
    };

    socket.on('message recieved', handleMessageReceived);
    
    return () => {
      socket.off('message recieved', handleMessageReceived);
    };
  }, [socket, selectedChatCompare, setNotification, setFetchAgain, setMessages]);

  const sendMessage = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', (selectedChat as Chat)._id)
      try {
        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${(user as User).token}` } };
        const messageData: any = { content: newMessage, chatId: selectedChat };
        if (replyingTo) messageData.replyTo = replyingTo._id;
        
        setNewMessage('');
        const { data } = await axios.post<Message>('/api/message', messageData, config);
        socket.emit('new message', data)
        setMessages([...messages, data])
        setReplyingTo(null); 
      } catch (error: any) {
        toast({ title: 'Error Occured!', description: 'Failed to send message', status: 'error', duration: 5000, position: 'bottom' });
      }
    }
  }

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', (selectedChat as Chat)._id);
    }
    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - lastTypingTime >= 3000 && typing) {
        socket.emit('stop typing', (selectedChat as Chat)._id);
        setTyping(false);
      }
    }, 3000);
  };

  const clearReply = () => setReplyingTo(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedChat) {
        setSelectedChat('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedChat, setSelectedChat]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Starting file upload for:', file.name, file.type);
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${(user as User).token}` } };
      const response = await axios.post('/api/upload', formData, config);
      console.log('Upload response:', response.data);
      return response.data.fileUrl;
    } catch (error: any) {
      console.error('File upload error:', error);
      console.error('Error response:', error.response);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast({ 
        title: 'Error Occured!', 
        description: error.response?.data?.message || error.message || 'Failed to upload file', 
        status: 'error', 
        duration: 5000, 
        position: 'bottom' 
      });
      throw error;
    }
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedChat) return;
    
    setUploading(true);
    
    const tempMessageId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempMessageId,
      sender: user as User,
      content: selectedFile.name,
      chat: selectedChat as any,
      fileType: selectedFile.type,
      fileName: selectedFile.name,
      isUploading: true,
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      console.log('Uploading file:', selectedFile.name, selectedFile.type);
      const fileUrl = await handleFileUpload(selectedFile);
      console.log('File uploaded successfully, URL:', fileUrl);
      
      const config = { 
        headers: { 
          'Content-type': 'application/json', 
          Authorization: `Bearer ${(user as User).token}` 
        } 
      };
      
      const messageData = { 
        content: selectedFile.name,
        chatId: selectedChat,
        fileUrl: fileUrl,
        fileType: selectedFile.type
      };
      
      console.log('Sending message with file data:', messageData);
      const { data } = await axios.post<Message>('/api/message', messageData, config);
      console.log('Message sent successfully:', data);
      socket.emit('new message', data);
      
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessageId ? data : msg
      ));
      
      setSelectedFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Send file error:', error);
      console.error('Error response:', error.response);
      toast({ 
        title: 'Error Occured!', 
        description: error.response?.data?.message || error.message || 'Failed to send file', 
        status: 'error', 
        duration: 5000, 
        position: 'bottom' 
      });
      
      setMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {selectedChat ? (
        <Flex flexDir="column" h="100%" w="100%" overflow="hidden">
          <Flex
            fontSize={{ base: '24px', md: '28px' }}
            p={3}
            w='100%'
            fontFamily='Work sans'
            alignItems='center'
            justifyContent='space-between'
            borderBottomWidth="1px"
            bg="whiteAlpha.900"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
              aria-label="Back"
              variant='ghost'
            />

            <Box flex="1" ml={2}>
              {selectedChat && typeof selectedChat !== 'string' && !selectedChat.isGroupChat ? (
                <Text fontWeight="bold">{getSender(user, selectedChat.users)}</Text>
              ) : (
                <Text fontWeight="bold">{typeof selectedChat !== 'string' && selectedChat.chatName.toUpperCase()}</Text>
              )}
            </Box>

            {selectedChat && typeof selectedChat !== 'string' && !selectedChat.isGroupChat ? (
              <ProfileModal user={getSenderFull(user, selectedChat.users) as User} />
            ) : (
              <UpdateGroupChatModal
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchMessages={fetchMessages}
              />
            )}
          </Flex>

          <Box
            display='flex'
            flexDir='column'
            flex="1" 
            p={3}
            bgImage="linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
            bgSize="cover"
            bgPosition="center"
            bgRepeat="no-repeat"
            overflowY='auto' 
            css={{
              '&::-webkit-scrollbar': { width: '5px' },
              '&::-webkit-scrollbar-thumb': { background: '#cbd5e0', borderRadius: '10px' },
            }}
          >
            {loading ? (
              <Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto' />
            ) : (
              <ScrollableChat messages={messages as any} setMessages={setMessages as any} />
            )}
          </Box>

          <Box p={3} bg="white" borderTopWidth="1px">
            {isTyping && (
              <Box mb={1} ml={2}>
                <Lottie options={defaultOptions} width={50} style={{ marginLeft: 0 }} />
              </Box>
            )}
            
            {replyingTo && (
              <Box 
                bg="gray.100" 
                borderLeft="4px solid" 
                borderColor="teal.500" 
                p={3} 
                mb={3} 
                borderRadius="lg" 
                boxShadow="sm"
                position="relative"
                top={-10}
              >
                <Flex justifyContent="space-between" alignItems="flex-start" mb={1}>
                   <Text fontSize="xs" fontWeight="bold" color="teal.700">Replying to {replyingTo.sender.name}</Text>
                   <CloseIcon fontSize="12px" cursor="pointer" onClick={clearReply} color="gray.500" />
                </Flex>
                <Text fontSize="sm" color="gray.700" noOfLines={2}>{replyingTo.content}</Text>
              </Box>
            )}

            {selectedFile && (
              <Box bg="blue.50" p={2} mb={2} borderRadius="md" border="1px solid" borderColor="blue.200">
                <Flex justifyContent="space-between" alignItems="center">
                  {uploading ? (
                    <Flex alignItems="center" gap={2}>
                      <Spinner size="sm" />
                       <Text fontSize="sm">sending...</Text> 
                    </Flex>
                  ) : (
                    <>
                      <Text fontSize="sm">
                        <ViewIcon mr={2} /> {selectedFile.name}
                      </Text>
                      <IconButton 
                        size="xs" 
                        colorScheme="blue" 
                        onClick={sendFileMessage}
                        aria-label="Send file"
                        icon={<ArrowBackIcon />}
                        isDisabled={uploading}
                      />
                    </>
                  )}
                </Flex>
              </Box>
            )}
            
            <FormControl onKeyDown={sendMessage} isRequired display='flex' alignItems='center'>
              <InputGroup>
                <Input
                  variant='filled'
                  bg='gray.100'
                  placeholder='Enter a message...'
                  onChange={typingHandler}
                  value={newMessage}
                  borderRadius='full'
                  _focus={{ bg: "white", borderColor: "teal.400" }}
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    aria-label="Upload file"
                    icon={<ViewIcon />}
                    size="sm"
                    colorScheme="teal"
                    onClick={() => fileInputRef.current?.click()}
                    mr={2}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="*/*"
            />
          </Box>
        </Flex>
      ) : (
        <Flex align='center' justify='center' h='100%' w="100%">
          <Text fontSize='3xl' fontFamily='Work sans' color='gray.400'>
            Click on a user to start chatting
          </Text>
        </Flex>
      )}
    </>
  )
}

export default SingleChat;