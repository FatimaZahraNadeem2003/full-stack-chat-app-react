import React, { useEffect, useState } from 'react';
import {
  Box, Flex, Text, IconButton, Spinner, FormControl, Input, useToast, InputGroup, InputRightElement,
} from '@chakra-ui/react';
import { ArrowBackIcon, ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider';
import ScrollableChat from './ScrollableChat';
import ReplyMessage from '../Miscellaneous/ReplyMessage';
import io from 'socket.io-client';
import EmojiPicker from './EmojiPicker'; // Import the EmojiPicker component

const ENDPOINT = "http://localhost:5000"; 
let socket: any, selectedChatCompare: any;

const SingleChat = ({ fetchAgain, setFetchAgain }: { fetchAgain: boolean; setFetchAgain: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<any>(null); 
  
  const { user, selectedChat, setSelectedChat } = ChatState();
  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat || typeof selectedChat === 'string') {
      console.log('No valid selected chat, skipping message fetch');
      return;
    }
    
    try {
      // Check for admin session first
      const adminInfoRaw = localStorage.getItem('adminInfo');
      const adminInfo = adminInfoRaw && adminInfoRaw !== 'null' ? JSON.parse(adminInfoRaw) : null;
      
      // Check for user session
      const userInfoRaw = localStorage.getItem('userInfo');
      const userInfo = userInfoRaw && userInfoRaw !== 'null' ? JSON.parse(userInfoRaw) : null;
      
      let token, endpoint;
      if (adminInfo && adminInfo._id && adminInfo.token) {
        // Admin mode
        token = adminInfo.token;
        endpoint = `/api/admin/message/${selectedChat._id}`;
      } else if (userInfo && userInfo._id && userInfo.token) {
        // User mode
        token = userInfo.token;
        endpoint = `/api/message/${selectedChat._id}`;
      } else {
        // No user logged in
        console.log('No user logged in, cannot fetch messages');
        toast({ title: "Please log in to continue", status: "warning" });
        return;
      }
      
      console.log('Fetching messages from endpoint:', endpoint);
      console.log('Selected chat ID:', selectedChat._id);
      console.log('Using token:', token ? 'Yes' : 'No');
      
      const config = { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      };
      
      setLoading(true);
      const startTime = Date.now();
      const { data } = await axios.get(endpoint, config);
      const endTime = Date.now();
      console.log(`Messages fetched in ${endTime - startTime}ms:`, data.length, 'messages');
      setMessages(data);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      let errorMessage = "Failed to load messages";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out - please check your connection";
      } else if (error.response) {
        errorMessage += `: ${error.response.status} - ${error.response.data.message || error.response.data.error || error.response.statusText}`;
        // Check if it's a 404 (chat not found) or 403 (not authorized)
        if (error.response.status === 404) {
          errorMessage = "Chat not found";
        } else if (error.response.status === 403) {
          errorMessage = "Access denied - you are not authorized to view this chat";
        }
      } else if (error.request) {
        errorMessage = 'Network error - unable to reach server';
      } else {
        errorMessage += `: ${error.message}`;
      }
      toast({ 
        title: "Error Occured!", 
        description: errorMessage, 
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false); // Make sure loading is always set to false
      socket.emit("join chat", selectedChat._id);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const sendMessage = async (event: any) => {
    if ((event.key === "Enter" || event.type === "click") && newMessage) {
      if (!selectedChat || typeof selectedChat === 'string') return;

      try {
        // Check for admin session first
        const adminInfoRaw = localStorage.getItem('adminInfo');
        const adminInfo = adminInfoRaw && adminInfoRaw !== 'null' ? JSON.parse(adminInfoRaw) : null;
        
        // Check for user session
        const userInfoRaw = localStorage.getItem('userInfo');
        const userInfo = userInfoRaw && userInfoRaw !== 'null' ? JSON.parse(userInfoRaw) : null;
        
        let token, endpoint;
        if (adminInfo && adminInfo._id && adminInfo.token) {
          // Admin mode
          token = adminInfo.token;
          endpoint = "/api/admin/message";
        } else if (userInfo && userInfo._id && userInfo.token) {
          // User mode
          token = userInfo.token;
          endpoint = "/api/message";
        } else {
          // No user logged in
          toast({ title: "Please log in to continue", status: "warning" });
          return;
        }
        
        const config = {
          headers: { "Content-type": "application/json", Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        };
        const messagePayload = {
          content: newMessage,
          chatId: selectedChat._id,
          replyTo: replyToMessage ? replyToMessage._id : null, 
        };
        setNewMessage("");
        setReplyToMessage(null); 
        const { data } = await axios.post(endpoint, messagePayload, config);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error: any) {
        console.error('Error sending message:', error);
        let errorMessage = "Failed to send message";
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timed out";
        } else if (error.response) {
          errorMessage += `: ${error.response.data.message || error.response.statusText}`;
        } else if (error.request) {
          errorMessage = 'Network error';
        } else {
          errorMessage += `: ${error.message}`;
        }
        toast({ 
          title: "Send Failed", 
          description: errorMessage, 
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }
    }
  };

  useEffect(() => {
    // Check for admin session first
    const adminInfoRaw = localStorage.getItem('adminInfo');
    const adminInfo = adminInfoRaw && adminInfoRaw !== 'null' ? JSON.parse(adminInfoRaw) : null;
    
    // Check for user session
    const userInfoRaw = localStorage.getItem('userInfo');
    const userInfo = userInfoRaw && userInfoRaw !== 'null' ? JSON.parse(userInfoRaw) : null;
    
    let userData;
    if (adminInfo && adminInfo._id && adminInfo.token) {
      // Admin mode
      userData = { ...adminInfo, isAdmin: true };
    } else if (userInfo && userInfo._id && userInfo.token) {
      // User mode
      userData = userInfo;
    } else {
      // No user logged in
      userData = {};
    }
    
    socket = io(ENDPOINT);
    socket.emit("setup", userData);
    socket.on("message received", (newMessageRecieved: any) => {
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
            
        } else {
            setMessages((prev) => [...prev, newMessageRecieved]);
        }
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  return (
    <>
      {selectedChat ? (
        <Flex flexDir="column" h="100%" w="100%">
          <Flex p={3} bg="white" align="center" justify="space-between" borderBottom="1px solid #eee">
            <IconButton 
              aria-label="Back Button"
              display={{ base: "flex", md: "none" }} 
              icon={<ArrowBackIcon />} 
              onClick={() => setSelectedChat("")} 
            />
            <Text fontWeight="bold">
              {typeof selectedChat !== 'string' && selectedChat.isGroupChat 
                ? selectedChat.chatName 
                : "Chat"}
            </Text>
          </Flex>

          <Box flex={1} bg="#E8E8E8" overflowY="hidden" display="flex" flexDir="column" p={3} borderRadius="lg">
            {loading ? (
              <Spinner size="xl" alignSelf="center" margin="auto" />
            ) : (
              <Box overflowY="auto" display="flex" flexDir="column">
                <ScrollableChat messages={messages} onReply={(msg: any) => setReplyToMessage(msg)} />
              </Box>
            )}

            <FormControl onKeyDown={sendMessage} mt={3} isRequired>
              
              {replyToMessage && (
                <Box mb="-2px" mx={1}>
                  <ReplyMessage 
                    message={replyToMessage} 
                    onClose={() => setReplyToMessage(null)} 
                  />
                </Box>
              )}

              <InputGroup>
                <Input
                  variant="filled"
                  bg="white"
                  placeholder="Enter a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  borderRadius={replyToMessage ? "0 0 10px 10px" : "full"}
                  _focus={{ bg: "white" }}
                />
                <InputRightElement width="4.5rem">
                  <Flex alignItems="center" height="100%">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    <IconButton 
                      aria-label="Send Message"
                      icon={<ChatIcon />} 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => sendMessage({type:"click"})} 
                     />
                  </Flex>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
        </Flex>
      ) : (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize="3xl">Select a chat to start</Text>
        </Flex>
      )}
    </>
  );
};

export default SingleChat;