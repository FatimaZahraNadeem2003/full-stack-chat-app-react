import React, { useEffect, useState } from 'react'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast, Flex, Avatar, InputGroup, InputRightElement } from '@chakra-ui/react';
import { ArrowBackIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull, Message } from './../../config/ChatLogics';
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from '../ScrollableChat';
import Lottie from 'react-lottie'
import animationData from '../../animations/typing.json'

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  pic?: string;
  isAdmin: boolean;
  token?: string;
}

interface AdminChat {
  _id: string;
  isGroupChat: boolean;
  users: User[];
  chatName: string;
}

interface AdminSingleChatProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  selectedChat: AdminChat | null;
  setSelectedChat: (chat: any) => void; 
  adminInfo: Admin;
  socket: any;
  messages: Message[]; 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const AdminSingleChat: React.FC<AdminSingleChatProps> = ({ 
  fetchAgain, 
  setFetchAgain, 
  selectedChat, 
  setSelectedChat,
  adminInfo,
  socket,
  messages,
  setMessages
}) => {
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

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const adminInfoLocal = JSON.parse(localStorage.getItem('adminInfo') || '{}');
      if (!adminInfoLocal || !adminInfoLocal.token) {
        throw new Error('Admin not authenticated');
      }
      
      const config = { headers: { Authorization: `Bearer ${adminInfoLocal.token}` } };
      const { data } = await axios.get<Message[]>(`/api/admin/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      if (socket) {
        socket.emit('join chat', selectedChat._id);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({ 
        title: 'Error Occured!', 
        description: error.response?.data?.message || error.message || 'Failed to load messages', 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
        position: 'bottom' 
      });
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      if (socket) {
        socket.emit('join chat', selectedChat._id);
      }
    }
  }, [selectedChat, socket]);

  const sendMessage = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage) {
      if (socket) {
        socket.emit('stop typing', selectedChat?._id);
      }
      try {
        const adminInfoLocal = JSON.parse(localStorage.getItem('adminInfo') || '{}');
        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${adminInfoLocal.token}` } };
        const messageData: any = { content: newMessage, chatId: selectedChat };
        if (replyingTo) messageData.replyTo = replyingTo._id;
        
        setNewMessage('');
        const { data } = await axios.post<Message>('/api/admin/message', messageData, config);
        if (socket) {
          socket.emit('new message', data);
        }
        setMessages([...messages, data]);
        setReplyingTo(null); 
      } catch (error: any) {
        toast({ title: 'Error Occured!', description: 'Failed to send message', status: 'error', duration: 5000, position: 'bottom' });
      }
    }
  }

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - lastTypingTime >= 3000 && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  const clearReply = () => setReplyingTo(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const adminInfoLocal = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${adminInfoLocal.token}` } };
    const response = await axios.post('/api/upload', formData, config);
    return response.data.fileUrl;
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedChat) return;
    setUploading(true);
    try {
      const fileUrl = await handleFileUpload(selectedFile);
      const adminInfoLocal = JSON.parse(localStorage.getItem('adminInfo') || '{}');
      const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${adminInfoLocal.token}` } };
      const { data } = await axios.post<Message>('/api/message', { content: selectedFile.name, chatId: selectedChat._id, fileUrl, fileType: selectedFile.type }, config);
      if (socket) socket.emit('new message', data);
      setMessages([...messages, data]);
      setSelectedFile(null);
    } catch (error) {
      toast({ title: 'Error!', description: 'Failed to send file', status: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {selectedChat ? (
        <Flex flexDir="column" h="100%" w="100%" overflow="hidden">
          <Flex fontSize={{ base: '24px', md: '28px' }} p={3} w='100%' fontFamily='Work sans' alignItems='center' justifyContent='space-between' borderBottomWidth="1px" bg="whiteAlpha.900">
            <IconButton display={{ base: 'flex', md: 'none' }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat(null)} aria-label="Back" variant='ghost' />

            <Box flex="1" ml={2}>
              {selectedChat && !selectedChat.isGroupChat ? (
                <Text fontWeight="bold">{getSender(adminInfo as User, selectedChat.users)}</Text>
              ) : (
                <Text fontWeight="bold">{selectedChat.chatName.toUpperCase()}</Text>
              )}
            </Box>

            {selectedChat && !selectedChat.isGroupChat ? (
              <ProfileModal user={getSenderFull(adminInfo as User, selectedChat.users) as User} />
            ) : (
              <UpdateGroupChatModal
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchMessages={fetchMessages}
              />
            )}
          </Flex>

          <Box display='flex' flexDir='column' flex="1" p={3} bg="gray.50" overflowY='auto'>
            {loading ? (
              <Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto' />
            ) : (
              <ScrollableChat 
                messages={messages} 
                setMessages={setMessages} 
              />
            )}
          </Box>

          <Box p={3} bg="white" borderTopWidth="1px">
            <FormControl onKeyDown={sendMessage} isRequired display='flex' alignItems='center'>
              <InputGroup>
                <Input variant='filled' bg='gray.100' placeholder='Enter a message...' onChange={typingHandler} value={newMessage} borderRadius='full' />
                <InputRightElement width="4.5rem">
                  <IconButton aria-label="Upload" icon={<ViewIcon />} size="sm" colorScheme="teal" onClick={() => fileInputRef.current?.click()} mr={2} />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          </Box>
        </Flex>
      ) : (
        <Flex align='center' justify='center' h='100%' w="100%">
          <Text fontSize='3xl' fontFamily='Work sans' color='gray.400'>Click on a user to start chatting</Text>
        </Flex>
      )}
    </>
  )
}

export default AdminSingleChat;