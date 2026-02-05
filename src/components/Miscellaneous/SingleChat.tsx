import React, { useEffect, useState, useRef } from 'react'
import { ChatState, User, Chat, Message } from "../../Context/ChatProvider";
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast, Flex, Avatar, InputGroup, InputRightElement } from '@chakra-ui/react';
import { ArrowBackIcon, AttachmentIcon } from '@chakra-ui/icons';
import { IoSend } from 'react-icons/io5';
import { getSender, getSenderFull } from "../../config/ChatLogics";
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat'; 
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from "../../animations/typing.json";
import EmojiPicker from './EmojiPicker';

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
  const [isTyping, setIsTyping] = useState(false);
  
  const { user, selectedChat, setSelectedChat, setNotification } = ChatState();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addEmoji = (emoji: string) => setNewMessage((prev) => prev + emoji);

  const currentChat = selectedChat as Chat;

  const fetchMessages = async () => {
    if (!selectedChat || typeof selectedChat === 'string') return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${(user as User).token}` } };
      const { data } = await axios.get<Message[]>(`/api/message/${currentChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit('join chat', currentChat._id);
    } catch (error) {
      toast({ title: 'Error!', description: "Failed to load messages", status: 'error', duration: 3000 });
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

  useEffect(() => {
    const handleMessageReceived = (newMessageRecieved: Message) => {
      if (!selectedChatCompare || typeof selectedChatCompare === 'string' || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        setNotification((prev: any) => [newMessageRecieved, ...prev]);
        setFetchAgain(prev => !prev);
      } else {
        setMessages(prev => [...prev, newMessageRecieved]);
      }
    };
    socket.on('message recieved', handleMessageReceived);
    return () => { socket.off('message recieved', handleMessageReceived); };
  }, [socket, selectedChatCompare]);

  const sendMessage = async () => {
    if (newMessage.trim() && currentChat) {
      socket.emit('stop typing', currentChat._id)
      try {
        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${(user as User).token}` } };
        const content = newMessage;
        setNewMessage('');
        const { data } = await axios.post<Message>('/api/message', { content, chatId: currentChat._id }, config);
        socket.emit('new message', data)
        setMessages([...messages, data])
      } catch (error) { toast({ title: 'Failed to send!', status: 'error' }); }
    }
  }

  return (
    <Flex flexDir="column" h="100%" w="100%" bg="#efeae2" position="relative">
      {selectedChat && typeof selectedChat !== 'string' ? (
        <>
          <Flex
            p={3} px={5} w='100%' alignItems='center' justifyContent='space-between'
            bg="white" borderBottom="1px solid #d1d7db" zIndex={10}
          >
            <Flex align="center">
              <IconButton display={{ base: 'flex', md: 'none' }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat('')} mr={2} aria-label="Back" variant="ghost" />
              
              <Avatar 
                size="sm" 
                mr={3} 
                src={!currentChat.isGroupChat ? (getSenderFull(user, currentChat.users) as User).pic : ""} 
                name={!currentChat.isGroupChat ? getSender(user, currentChat.users) : currentChat.chatName} 
              />
              
              <Box>
                <Text fontWeight="bold" fontSize="md" color="#111b21">
                  {currentChat.isGroupChat ? currentChat.chatName : getSender(user, currentChat.users)}
                </Text>
                <Text fontSize="xs" color={isTyping ? "green.500" : "gray.500"}>
                    {isTyping ? "typing..." : "online"}
                </Text>
              </Box>
            </Flex>
            {!currentChat.isGroupChat ? (
                <ProfileModal user={getSenderFull(user, currentChat.users) as User} />
            ) : (
                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
            )}
          </Flex>

          <Box 
            flex="1" p={4} overflowY='auto' 
            bgImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')"
            bgRepeat="repeat"
            sx={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '10px' } }}
          >
            {loading ? (
                <Spinner size='xl' margin='auto' display="block" mt="20%" color="teal.500" />
            ) : (
                <ScrollableChat messages={messages} />
            )}
            {isTyping && (
                <Box width="60px" ml={2} mt={2} bg="white" borderRadius="20px" p={1} boxShadow="sm">
                    <Lottie options={{ animationData }} width={40} />
                </Box>
            )}
          </Box>

          <Box p={3} bg="#f0f2f5">
             <Flex align="center" gap={2}>
                <Box bg="white" borderRadius="25px" flex={1} display="flex" alignItems="center" px={2} boxShadow="sm" border="1px solid #e2e8f0">
                   <EmojiPicker onEmojiSelect={addEmoji} />
                   <Input
                     variant="unstyled"
                     placeholder="Type a message"
                     p={3}
                     fontSize="md"
                     value={newMessage}
                     onChange={(e) => {
                        setNewMessage(e.target.value);
                        if(!socketConnected) return;
                        socket.emit('typing', currentChat._id);
                        let lastTypingTime = new Date().getTime();
                        setTimeout(() => {
                            let timeNow = new Date().getTime();
                            if (timeNow - lastTypingTime >= 3000) socket.emit('stop typing', currentChat._id);
                        }, 3000);
                     }}
                     onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                   />
                   <IconButton 
                    aria-label="attach" 
                    icon={<AttachmentIcon />} 
                    variant="ghost" 
                    borderRadius="full" 
                    color="gray.600" 
                    onClick={() => fileInputRef.current?.click()} 
                   />
                </Box>
                <IconButton
                  colorScheme="teal"
                  icon={<IoSend size="20px" color="white" />}
                  borderRadius="full"
                  onClick={sendMessage}
                  h="46px" w="46px"
                  boxShadow="lg"
                  _hover={{ bg: "teal.600", transform: "scale(1.05)" }}
                  aria-label="Send"
                />
             </Flex>
             <input type="file" ref={fileInputRef} style={{ display: 'none' }} />
          </Box>
        </>
      ) : (
        <Flex align='center' justify='center' h='100%' bg="#f8f9fa" flexDir="column" textAlign="center">
            <Box p={10}>
                <Avatar size="2xl" mb={6} bg="teal.500" icon={<IoSend color="white" size="40px" />} />
                <Text fontSize='3xl' fontWeight="300" color='#41525d'>Chat App Web</Text>
                <Text color="#667781" mt={4} maxW="400px">
                    Send and receive messages with ease. Modern, fast, and secure.
                </Text>
                <Box mt={10} borderTop="1px solid #e9edef" pt={5}>
                    <Text fontSize="sm" color="#8696a0">🔒 End-to-end encrypted</Text>
                </Box>
            </Box>
        </Flex>
      )}
    </Flex>
  )
}

export default SingleChat;