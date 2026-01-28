import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  Flex,
  HStack,
  IconButton,
  Portal
} from '@chakra-ui/react';

import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FiSearch } from "react-icons/fi";
import { ChatState } from './../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge, { Effect } from 'react-notification-badge';
import { AddIcon } from '@chakra-ui/icons';
import GroupChatModal from './GroupChatModal';

const SideDrawer: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const history = useHistory();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push('/');
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Enter something to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-left',
      });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to load search results',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-left',
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('/api/chat', { userId }, config);

      if (!chats.find((c: any) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error fetching chat',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        backdropFilter="blur(12px)"
        bg="rgba(255,255,255,0.7)"
        boxShadow="0 8px 25px rgba(0,0,0,0.1)"
        borderBottom="1px solid rgba(255,255,255,0.3)"
        borderRadius="0 0 15px 15px"
        w="100%"
        p="12px 20px"
      >
        <Text
          fontSize="2xl"
          fontWeight="700"
          bgGradient="linear(to-r, purple.500, blue.400)"
          bgClip="text"
          fontFamily="Poppins"
          flex="1"
        >
          Chatting
        </Text>

        <Tooltip label="Search Users" hasArrow placement="bottom">
          <Button
            variant="ghost"
            onClick={onOpen}
            leftIcon={<FiSearch size={18} />}
            _hover={{ bg: "gray.200", transform: "scale(1.05)" }}
          >
            Search
          </Button>
        </Tooltip>

        <Flex flex="1" justify="flex-end" align="center" gap={5}>
          <Menu isLazy>
            <MenuButton
              as={IconButton}
              variant="ghost"
              icon={<BellIcon boxSize={6} />}
              position="relative"
            >
              {notification.length > 0 && (
                <NotificationBadge
                  count={notification.length}
                  effect={Effect.SCALE}
                  style={{ position: 'absolute', top: -5, right: -5, zIndex: 9999 }}
                />
              )}
            </MenuButton>
            <Portal>
              <MenuList zIndex={9999}>
                {!notification.length && <Text px={3} py={2}>No new messages</Text>}
                {notification.map((notif: any) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n: any) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New message in ${notif.chat.chatName}`
                      : `New message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>

          <Menu isLazy>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              _hover={{ bg: "gray.200" }}
            >
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <Portal>
              <MenuList zIndex={9999}>
                <ProfileModal user={user}>
                  <MenuItem>My Profile</MenuItem>
                </ProfileModal>
                <MenuDivider />
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent
          bg="rgba(255,255,255,0.85)"
          backdropFilter="blur(10px)"
          boxShadow="xl"
          borderRadius="md"
        >
          <DrawerHeader borderBottomWidth="1px" fontWeight="700">
            Search Users
          </DrawerHeader>

          <DrawerBody>
            <HStack pb={3} gap={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="12px"
                focusBorderColor="blue.400"
                boxShadow="sm"
              />
              <Button colorScheme="blue" onClick={handleSearch} _hover={{ transform: "scale(1.05)" }}>
                Go
              </Button>
            </HStack>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && (
              <Spinner display="flex" ml="auto" mt={4} />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
