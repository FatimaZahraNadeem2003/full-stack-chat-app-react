import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import { ChatState, Message } from '../../Context/ChatProvider';
import { DeleteIcon, ChatIcon, SmallCloseIcon } from '@chakra-ui/icons';
import axios from 'axios';

interface MessageContextMenuProps {
  message: Message;
  onReply: (message: Message) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({ 
  message, 
  onReply, 
  messages, 
  setMessages 
}) => {
  const { user, selectedChat } = ChatState();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toast = useToast();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isOwnMessage = message.sender._id === user?._id;
  const currentChat = selectedChat as any;

  const handleDeleteForMe = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        data: {
          messageId: message._id,
          deleteForEveryone: false
        }
      };

      await axios.delete(`/api/message/${message._id}`, config);
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== message._id)
      );

      toast({
        title: 'Message deleted',
        description: 'Message deleted for you',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error deleting message',
        description: error.response?.data?.message || 'Failed to delete message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteForEveryone = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        data: {
          messageId: message._id,
          deleteForEveryone: true
        }
      };

      await axios.delete(`/api/message/${message._id}`, config);
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== message._id)
      );

      toast({
        title: 'Message deleted',
        description: 'Message deleted for everyone',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error deleting message',
        description: error.response?.data?.message || 'Failed to delete message for everyone',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Message options"
          icon={
            <Box 
              as="span" 
              fontSize="16px" 
              fontWeight="bold"
              color="gray.500"
              _hover={{ color: "gray.700" }}
            >
              ⋯
            </Box>
          }
          variant="ghost"
          size="sm"
          opacity={0}
          _groupHover={{ opacity: 1 }}
          ref={menuButtonRef}
        />
        <MenuList minWidth="180px" zIndex={2000}>
          <MenuItem 
            icon={<ChatIcon />} 
            onClick={() => onReply(message)}
          >
            Reply
          </MenuItem>
          <MenuItem 
            icon={<DeleteIcon />} 
            color="red.500"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>Are you sure you want to delete this message?</Text>
            
            <Flex align="center" mb={4} p={3} bg="gray.50" borderRadius="md">
              <Avatar size="sm" src={message.sender.pic} name={message.sender.name} mr={3} />
              <Box>
                <Text fontWeight="bold" fontSize="sm">{message.sender.name}</Text>
                <Text fontSize="sm">{message.content}</Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(message.createdAt).toLocaleString()}
                </Text>
              </Box>
            </Flex>

            <Flex gap={3}>
              <Button 
                flex={1} 
                onClick={handleDeleteForMe}
                colorScheme="red"
                variant="outline"
              >
                Delete for me
              </Button>
              {isOwnMessage && (
                <Button 
                  flex={1} 
                  onClick={handleDeleteForEveryone}
                  colorScheme="red"
                >
                  Delete for everyone
                </Button>
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MessageContextMenu;