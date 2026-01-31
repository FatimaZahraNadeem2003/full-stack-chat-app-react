import React, { useState } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  Text
} from '@chakra-ui/react';
import { ChatState } from '../../Context/ChatProvider';
import { HamburgerIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import axios from 'axios';

interface MessageContextMenuProps {
  message: any;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onReply: (message: any) => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({ 
  message, 
  messages, 
  setMessages,
  onReply 
}) => {
  const { user } = ChatState();
  const toast = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMyMessage = user && message.sender._id === user._id;

  const handleDeleteForMe = async () => {
    try {
      const updatedMessages = messages.filter(m => m._id !== message._id);
      setMessages(updatedMessages);
      
      toast({
        title: 'Message deleted for you',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting message',
        description: error.response?.data?.message || 'Failed to delete message',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!user) {
      toast({
        title: 'User not authenticated',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      });
      return;
    }
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.delete(`/api/message/${message._id}`, config);
      
      const updatedMessages = messages.filter(m => m._id !== message._id);
      setMessages(updatedMessages);
      
      toast({
        title: 'Message deleted for everyone',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting message',
        description: error.response?.data?.message || 'Failed to delete message',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      });
    }
  };

  const handleTagMessage = () => {
    onReply(message);
  };

  return (
    <Menu isOpen={isMenuOpen} onOpen={() => setIsMenuOpen(true)} onClose={() => setIsMenuOpen(false)}>
      <MenuButton
        as={IconButton}
        aria-label="Message options"
        icon={<HamburgerIcon />}
        size="xs"
        variant="ghost"
        color="gray.500"
        _hover={{ bg: 'gray.100', color: 'gray.700' }}
        opacity={0}
        className="message-menu-button"
        transition="opacity 0.2s"
        ml={2}
      />
      <MenuList 
        minWidth="180px"
        zIndex={9999}
        boxShadow="xl"
        border="1px solid"
        borderColor="gray.200"
      >
        {/* <MenuItem 
          icon={<RepeatIcon />} 
          onClick={handleTagMessage}
          _hover={{ bg: 'blue.50' }}
        >
          <Text fontSize="sm">Reply to message</Text>
        </MenuItem> */}
        
        <MenuItem 
          icon={<DeleteIcon />} 
          onClick={handleDeleteForMe}
          color="red.500"
          _hover={{ bg: 'red.50' }}
        >
          <Text fontSize="sm">Delete for me</Text>
        </MenuItem>
        
        {isMyMessage && (
          <MenuItem 
            icon={<DeleteIcon />} 
            onClick={handleDeleteForEveryone}
            color="red.500"
            _hover={{ bg: 'red.50' }}
          >
            <Text fontSize="sm">Delete for everyone</Text>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

export default MessageContextMenu;