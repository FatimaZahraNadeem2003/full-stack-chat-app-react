import React, { useState } from 'react';
import { Badge, Menu, MenuButton, MenuList, MenuItem, Button, Box, Text, Avatar, Flex, VStack, Icon, Collapse, Portal } from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import { getSender } from '../../config/ChatLogics';

interface NotificationBadgeProps {
  children?: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ children }) => {
  const { notification, setNotification } = ChatState();
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const clearNotifications = () => {
    setNotification([]);
  };

  return (
    <Box position="relative" className="notification-dropdown">
      <Menu isOpen={isOpen} placement="bottom-end">
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
                [...notification].reverse().map((msg, index) => (
                  <MenuItem 
                    key={`${msg._id}-${index}`} 
                    px={3} 
                    py={2} 
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    <Flex align="center" gap={3}>
                      <Avatar 
                        size="sm" 
                        name={msg.sender?.name} 
                        src={msg.sender?.pic} 
                      />
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="600">
                          {msg.sender?.name}: {msg.content}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          New message in {msg.chat?.chatName || 'chat'}
                        </Text>
                      </Box>
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