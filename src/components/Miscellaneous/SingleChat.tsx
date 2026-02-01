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

const ENDPOINT = "http://localhost:5000"; 
let socket: any, selectedChatCompare: any;

const SingleChat = ({ fetchAgain, setFetchAgain }: { fetchAgain: boolean; setFetchAgain: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<any>(null); 
  
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [adminUser, setAdminUser] = useState<any>(null);
  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat || typeof selectedChat === 'string') return;
    
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({ title: "Error Occured!", status: "error" });
    }
  };

  const sendMessage = async (event: any) => {
    if ((event.key === "Enter" || event.type === "click") && newMessage) {
      if (!selectedChat || typeof selectedChat === 'string') return;

      try {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
        const config = {
          headers: { "Content-type": "application/json", Authorization: `Bearer ${adminInfo.token}` },
        };
        const messagePayload = {
          content: newMessage,
          chatId: selectedChat._id,
          replyTo: replyToMessage ? replyToMessage._id : null, 
        };
        setNewMessage("");
        setReplyToMessage(null); 
        const { data } = await axios.post("/api/message", messagePayload, config);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({ title: "Failed to send", status: "error" });
      }
    }
  };

  useEffect(() => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    setAdminUser(adminInfo);
    
    socket = io(ENDPOINT);
    socket.emit("setup", adminInfo);
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
                <InputRightElement>
                   <IconButton 
                    aria-label="Send Message"
                    icon={<ChatIcon />} 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => sendMessage({type:"click"})} 
                   />
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