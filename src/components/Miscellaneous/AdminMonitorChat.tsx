import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Avatar,
  VStack,
  HStack,
  IconButton,
  useToast,
  FormControl,
  InputGroup,
  InputRightElement,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, ViewIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import io from 'socket.io-client';

axios.defaults.baseURL = 'http://localhost:5000';

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

interface AdminMonitorChatProps {
  selectedChat: Chat | null;  
  onClose: () => void;
}

const AdminMonitorChat: React.FC<AdminMonitorChatProps> = ({ selectedChat, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}') || {};

  const fetchMessages = async () => {
    if (!selectedChat || !adminInfo?._id) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo?.token || ''}`
        }
      };

      const { data } = await axios.get<Message[]>(`/api/admin/chat/${selectedChat._id}/messages`, config);
      setMessages(data);
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

  const sendMessage = async (fileUrl?: string, fileName?: string, fileType?: string) => {
    if (!selectedChat || (!newMessage.trim() && !fileUrl) || isSending) return;
    
    const isAdminGroupAdmin = selectedChat?.groupAdmin?._id === adminInfo?._id;
    
    if (!selectedChat.isGroupChat || !isAdminGroupAdmin) {
      toast({
        title: 'Permission denied',
        description: 'Admin cannot send messages in personal chats or non-admin groups',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      return;
    }

    setIsSending(true);

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${adminInfo?.token || ''}`
        }
      };

      const messageData: any = {
        content: newMessage,
        chatId: selectedChat._id
      };

      if (fileUrl) {
        messageData.fileUrl = fileUrl;
        messageData.fileName = fileName;
        messageData.fileType = fileType;
      }

      const { data } = await axios.post<Message>('/api/message', messageData, config);
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.response?.data?.message || 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    } finally {
      setIsSending(false);
    }
  };

  const removeFromGroup = async (userId: string) => {
    if (!selectedChat) return;
    
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${adminInfo?.token || ''}`
        }
      };

      await axios.put(`/api/chat/groupremove`, {
        chatId: selectedChat._id,
        userId,
      });

      fetchMessages();
      toast({
        title: 'User removed',
        description: 'User has been removed from the group',
        status: 'success',
        duration: 3000,
        position: 'bottom'
      });
    } catch (error: any) {
      toast({
        title: 'Error removing user',
        description: error.response?.data?.message || 'Failed to remove user',
        status: 'error',
        duration: 5000,
        position: 'bottom'
      });
    }
  };

  const addToGroup = async (userId: string) => {
    if (!selectedChat) return;
    
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${adminInfo?.token || ''}`
        }
      };

      await axios.put(`/api/chat/groupadd`, {
        chatId: selectedChat._id,
        userId,
      });

      fetchMessages();
      toast({
        title: 'User added',
        description: 'User has been added to the group',
        status: 'success',
        duration: 3000,
        position: 'bottom'
      });
    } catch (error: any) {
      toast({
        title: 'Error adding user',
        description: error.response?.data?.message || 'Failed to add user',
        status: 'error',
        duration: 5000,
        position: 'bottom'
      });
    }
  };

  const renameGroup = async (newName: string) => {
    if (!selectedChat) return;
    
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${adminInfo?.token || ''}`
        }
      };

      await axios.put(`/api/chat/rename`, {
        chatId: selectedChat._id,
        chatName: newName,
      });

      fetchMessages();
      toast({
        title: 'Group renamed',
        description: 'Group name has been updated',
        status: 'success',
        duration: 3000,
        position: 'bottom'
      });
    } catch (error: any) {
      toast({
        title: 'Error renaming group',
        description: error.response?.data?.message || 'Failed to rename group',
        status: 'error',
        duration: 5000,
        position: 'bottom'
      });
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'chat_app');

    try {
      setIsUploading(true);
      const response = await fetch(`https://api.cloudinary.com/v1_1/dvgxpslyi/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return {
        fileUrl: data.secure_url,
        fileName: data.original_filename,
        fileType: data.resource_type
      };
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onOpen();
    }
  };

  const confirmSendFile = async () => {
    if (!selectedChat || !selectedFile) return;

    onModalClose();

    const tempMessageId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempMessageId,
      sender: {
        _id: adminInfo._id || '',
        name: adminInfo.name || 'Admin',
        email: adminInfo.email || '',
        pic: adminInfo.pic || '',
      },
      content: selectedFile.name,
      chat: selectedChat as any,
      fileType: selectedFile.type,
      fileName: selectedFile.name,
      isUploading: true,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);

    const uploadedFile = await uploadFile(selectedFile);
    if (!uploadedFile) {
      setMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
      return;
    }

    await sendMessage(uploadedFile.fileUrl, uploadedFile.fileName, uploadedFile.fileType);

    setMessages(prev => prev.filter(msg => msg._id !== tempMessageId));

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
  }, [messages]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isAdminGroupAdmin = selectedChat?.groupAdmin?._id && adminInfo?._id ? selectedChat?.groupAdmin?._id === adminInfo?._id : false;

  if (!selectedChat) {
    return (
      <Flex direction="column" h="100%" w="100%" align="center" justify="center">
        <Text>No chat selected</Text>
      </Flex>
    );
  }

  if (!adminInfo?._id) {
    return (
      <Flex direction="column" h="100%" w="100%" align="center" justify="center">
        <Text>Admin not authenticated</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%" w="100%">
      <Flex
        align="center"
        p={4}
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Go back"
          variant="ghost"
          onClick={onClose}
          mr={4}
        />
        <Box flex="1">
          <Text fontWeight="bold">{selectedChat.chatName}</Text>
          {!selectedChat.isGroupChat && (
            <Text fontSize="sm" color="gray.500">
              Individual chat
            </Text>
          )}
        </Box>
        {selectedChat.isGroupChat && (
          <Badge colorScheme={isAdminGroupAdmin ? "green" : "purple"}>
            {isAdminGroupAdmin ? "Admin" : "Member"}
          </Badge>
        )}
      </Flex>

      <VStack
        spacing={3}
        p={4}
        flex="1"
        overflowY="auto"
        align="stretch"
        bg="gray.50"
      >
        {messages.map((msg) => (
          <Flex
            key={msg._id}
            justify={msg.sender._id === adminInfo?._id ? 'flex-end' : 'flex-start'}
          >
            <Flex
              maxW="70%"
              p={3}
              borderRadius="lg"
              bg={msg.sender._id === adminInfo?._id ? 'teal.500' : 'white'}
              color={msg.sender._id === adminInfo?._id ? 'white' : 'black'}
              boxShadow="md"
            >
              <VStack spacing={1} align="stretch" w="100%">
                <HStack spacing={2} justify="space-between">
                  <Text fontWeight="bold" fontSize="xs">
                    {msg.sender.name}
                  </Text>
                  <Text fontSize="xs" opacity={0.7}>
                    {formatDate(msg.createdAt)}
                  </Text>
                </HStack>
                
                {msg.fileUrl ? (
                  <Box>
                    <a 
                      href={msg.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: msg.sender._id === adminInfo?._id ? 'white' : 'teal.500',
                        textDecoration: 'underline'
                      }}
                    >
                      <ViewIcon mr={2} />
                      {msg.fileName || msg.content}
                    </a>
                  </Box>
                ) : (
                  <Text whiteSpace="pre-wrap">{msg.content}</Text>
                )}
              </VStack>
            </Flex>
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      {selectedChat.isGroupChat && (
        <Box bg="orange.50" p={3} mb={2} borderRadius="md">
          <Text fontSize="xs" fontWeight="bold" mb={2} color="orange.700">GROUP MEMBERS</Text>
          <VStack spacing={1} align="stretch">
            {selectedChat.users.map(user => (
              <Flex key={user._id} justify="space-between" align="center" p={2} bg="white" borderRadius="md">
                <Flex align="center">
                  <Avatar size="xs" src={user.pic} mr={2} />
                  <Text fontSize="sm">{user.name}</Text>
                  {selectedChat.groupAdmin?._id === user._id && (
                    <Badge ml={2} colorScheme="green" size="xs">Admin</Badge>
                  )}
                </Flex>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      {selectedChat.isGroupChat && isAdminGroupAdmin && (
        <>
          {selectedFile && (
            <Box bg="blue.50" p={2} mb={2} borderRadius="md" border="1px solid" borderColor="blue.200">
              <Flex justifyContent="space-between" alignItems="center">
                {isUploading ? (
                  <Flex alignItems="center" gap={2}>
                    <Text fontSize="sm">Uploading...</Text>
                  </Flex>
                ) : (
                  <>
                    <Text fontSize="sm">
                      <ViewIcon mr={2} /> {selectedFile.name}
                    </Text>
                    <IconButton 
                      size="sm" 
                      colorScheme="blue" 
                      onClick={confirmSendFile}
                      aria-label="Send file"
                      icon={<ArrowBackIcon />}
                      isDisabled={isUploading}
                    />
                  </>
                )}
              </Flex>
            </Box>
          )}
          
          <Box p={4} bg="white" borderTopWidth="1px" borderColor="gray.200">
            <FormControl onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}>
              <InputGroup>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  bg="gray.100"
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

          <Button
            onClick={() => sendMessage()}
            colorScheme="teal"
            size="sm"
            isDisabled={!newMessage.trim() || isSending}
            mt={2}
            mx={4}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </>
      )}

      {(!selectedChat.isGroupChat || (selectedChat.isGroupChat && !isAdminGroupAdmin)) && (
        <Box bg="gray.100" p={3} textAlign="center" borderTopWidth="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600">
            Read-only mode: Admin cannot send messages in personal chats or non-admin groups
          </Text>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm File Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="md">
              Do you want to send this file: <strong>{selectedFile?.name}</strong>?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={confirmSendFile}
              isLoading={isUploading}
            >
              Send File
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AdminMonitorChat;