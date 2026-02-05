import React, { useEffect, useState, useRef } from 'react'
import { ChatState, User, Chat, Message } from "../Context/ChatProvider";
import { 
  Box, 
  FormControl, 
  IconButton, 
  Input, 
  Spinner, 
  Text, 
  useToast, 
  Flex, 
  Avatar, 
  InputGroup, 
  InputRightElement
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/image';
import { ArrowBackIcon, AttachmentIcon, ViewIcon, CloseIcon } from '@chakra-ui/icons';
import { IoSend } from 'react-icons/io5';
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from './Miscellaneous/ProfileModal';
import UpdateGroupChatModal from './Miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat'; 
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from "../animations/typing.json";
import EmojiPicker from './Miscellaneous/EmojiPicker';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const { user, selectedChat, setSelectedChat, setNotification } = ChatState();

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Create config with progress tracking
    const config = { 
      headers: { 
        'Content-Type': 'multipart/form-data', 
        Authorization: `Bearer ${(user as User).token}` 
      },
      onUploadProgress: (progressEvent: any) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setUploadProgress(progress);
      }
    };
    
    try {
      const response = await axios.post('/api/upload', formData, config);
      setUploadProgress(null); // Reset progress after upload
      return response.data; 
    } catch (error) {
      setUploadProgress(null); // Reset progress on error
      throw error;
    }
  };

  const sendMessage = async () => {
    if ((newMessage.trim() || selectedFile) && currentChat) {
      socket.emit('stop typing', currentChat._id);
      try {
        setUploading(true);
        let fileData = { fileUrl: "", fileType: "", fileName: "" };
        
        if (selectedFile) {
          fileData = await handleFileUpload(selectedFile);
        }

        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${(user as User).token}` } };
        const { data } = await axios.post<Message>('/api/message', { 
            content: newMessage || selectedFile?.name, 
            chatId: currentChat._id,
            ...fileData
        }, config);

        socket.emit('new message', data);
        setMessages([...messages, data]);
        setNewMessage('');
        setSelectedFile(null);
        setUploading(false);
      } catch (error) { 
        toast({ title: 'Error!', status: 'error' });
        setUploading(false);
      }
    }
  }

  return (
    <Flex flexDir="column" h="100%" w="100%" bg="#efeae2" position="relative">
      {selectedChat && typeof selectedChat !== 'string' ? (
        <>
          {/* HEADER SECTION */}
          <Flex 
            p={3} px={5} w='100%' alignItems='center' justifyContent='space-between' 
            bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(10px)" 
            borderBottom="1px solid #d1d7db" zIndex={10}
          >
             <Flex align="center">
                <IconButton display={{ base: 'flex', md: 'none' }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat('')} mr={2} variant="ghost" aria-label="back"/>
                <Avatar 
                  size="sm" mr={3} 
                  src={(getSenderFull(user, currentChat.users) as User).pic} 
                  name={getSender(user, currentChat.users)} 
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
             <Box>
                {!currentChat.isGroupChat ? (
                  <ProfileModal user={getSenderFull(user, currentChat.users) as User} />
                ) : (
                  <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                )}
             </Box>
          </Flex>

          {/* CHAT BODY (WALLPAPER) */}
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

          {/* FILE PREVIEW CAPSULE */}
          {selectedFile && (
            <Box px={4} py={2} bg="white" borderTop="1px solid #e2e8f0">
               <Flex align="center" bg="#f0f2f5" p={3} borderRadius="15px" justify="space-between" boxShadow="inner">
                  <Flex align="center" overflow="hidden">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image 
                        src={previewUrl || ''} 
                        alt="preview" 
                        boxSize="40px" 
                        objectFit="cover" 
                        borderRadius="md" 
                        mr={3} 
                      />
                    ) : selectedFile.type.startsWith('video/') ? (
                      <Box boxSize="40px" bg="gray.200" display="flex" alignItems="center" justifyContent="center" borderRadius="md" mr={3}>
                        <AttachmentIcon color="gray.500" />
                      </Box>
                    ) : (
                      <AttachmentIcon mr={3} color="teal.500" />
                    )}
                    <Box overflow="hidden">
                      <Text fontSize="sm" fontWeight="bold" isTruncated>{selectedFile.name}</Text>
                      {uploading ? (
                        <Flex align="center">
                          <Spinner size="xs" mr={2} />
                          <Text fontSize="xs" color="blue.500">Uploading...</Text>
                        </Flex>
                      ) : (
                        <Text fontSize="xs" color="gray.500">{formatFileSize(selectedFile.size)} • Ready to send</Text>
                      )}
                    </Box>
                  </Flex>
                  <IconButton 
                    size="sm" 
                    icon={<CloseIcon />} 
                    colorScheme="red" 
                    variant="ghost" 
                    borderRadius="full"
                    onClick={() => !uploading && setSelectedFile(null)} 
                    aria-label="cancel" 
                    isDisabled={uploading}
                  />
               </Flex>
            </Box>
          )}

          {/* FOOTER INPUT BAR */}
          <Box p={3} bg="#f0f2f5">
             <Flex align="center" gap={3}>
                <Box bg="white" borderRadius="30px" flex={1} display="flex" alignItems="center" px={3} boxShadow="sm" border="1px solid #e2e8f0">
                   <EmojiPicker onEmojiSelect={addEmoji} />
                   <Input
                     variant="unstyled"
                     placeholder={uploading ? (uploadProgress !== null ? `Uploading... ${uploadProgress}%` : "Sending file...") : "Type a message"}
                     p={3}
                     fontSize="md"
                     value={newMessage}
                     isDisabled={uploading}
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
                    _hover={{ color: "teal.500", bg: "gray.100" }}
                    onClick={() => fileInputRef.current?.click()} 
                    isDisabled={uploading}
                   />
                </Box>
                
                <IconButton
                  colorScheme="teal"
                  icon={uploading ? <Spinner size="sm" color="white" /> : <IoSend size="22px" color="white" />}
                  borderRadius="full"
                  onClick={sendMessage}
                  h="50px" w="50px"
                  boxShadow="lg"
                  _hover={{ bg: "teal.600", transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                  aria-label="Send"
                  isDisabled={uploading || (!newMessage.trim() && !selectedFile)}
                />
             </Flex>
             <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
             />
          </Box>
        </>
      ) : (
        /* WELCOME SCREEN */
        <Flex align='center' justify='center' h='100%' bg="#f8f9fa" flexDir="column" textAlign="center">
            <Box p={10}>
                <Avatar 
                  size="2xl" mb={6} bg="teal.500" 
                  icon={<IoSend color="white" size="40px" style={{ transform: "rotate(-10deg)" }} />} 
                />
                <Text fontSize='3xl' fontWeight="300" color='#41525d'>WhatsApp Web Clone</Text>
                <Text color="#667781" mt={4} maxW="400px">
                    Send and receive messages with ease. Modern, fast, and secure communication.
                </Text>
                <Flex mt={10} color="#8696a0" align="center" justify="center" fontSize="sm">
                  <Text>🔒 End-to-end encrypted</Text>
                </Flex>
            </Box>
        </Flex>
      )}
    </Flex>
  )
}

export default SingleChat;