import React, { useState, useEffect, useRef } from 'react';
import { Badge, Menu, MenuButton, MenuList, MenuItem, Button, Box, Text, Avatar, Flex, VStack, Portal, useToast } from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';

interface NotificationBadgeProps {
  children?: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ children }) => {
  const { user, notification, setNotification, setSelectedChat } = ChatState();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const clearNotifications = async () => {
    if (!user) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.put('/api/message/clear-notifications', {}, config);
      
      setNotification([]);
      
      toast({
        title: 'Notifications cleared',
        description: 'All notifications have been cleared successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error clearing notifications',
        description: error.response?.data?.message || 'Failed to clear notifications',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <Box position="relative" ref={menuRef}>
      <Menu isOpen={isOpen} placement="bottom-end" onClose={() => setIsOpen(false)}>
        <MenuButton 
          as={Button} 
          variant="ghost" 
          onClick={handleMenuToggle}
          position="relative"
          minW="unset"
          w="fit-content"
          p={2}
        >
          <BellIcon boxSize={6} />
          {notification.length > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="0.6rem"
              minW="16px"
              h="16px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {notification.length}
            </Badge>
          )}
        </MenuButton>
        
        <Portal>
          <MenuList
            maxH="300px"
            overflowY="auto"
            minWidth="300px"
            maxHeight="400px"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.200"
            zIndex={9999}
          >
            <Flex justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid" borderColor="gray.200">
              <Text fontWeight="bold" fontSize="md">Notifications</Text>
              {notification.length > 0 && (
                <Button size="xs" onClick={clearNotifications} colorScheme="red">
                  Clear All
                </Button>
              )}
            </Flex>
            
            <VStack spacing={1} align="stretch" maxH="300px" overflowY="auto">
              {notification.length > 0 ? (
                [...notification].reverse().map((notif, index) => (
                  <MenuItem 
                    key={`${notif._id}-${index}`} 
                    px={3} 
                    py={2} 
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setIsOpen(false);
                      setNotification(prev => prev.map(n => 
                        n._id === notif._id ? {...n, isRead: true} : n
                      ));
                    }}
                  >
                    <Flex align="center" gap={3}>
                      <Avatar 
                        size="sm" 
                        name={notif.sender?.name} 
                        src={notif.sender?.pic} 
                      />
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="600">
                          {notif.sender?.name}
                        </Text>
                        <Text fontSize="sm" color="gray.700" noOfLines={1}>
                          {notif.content}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                        </Text>
                      </Box>
                      {!notif.isRead && (
                        <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                      )}
                    </Flex>
                  </MenuItem>
                ))
              ) : (
                <MenuItem isDisabled>
                  <Text textAlign="center" w="100%" color="gray.500">
                    No new notifications
                  </Text>
                </MenuItem>
              )}
            </VStack>
          </MenuList>
        </Portal>
      </Menu>
      
      {children}
    </Box>
  );
};

export default NotificationBadge;