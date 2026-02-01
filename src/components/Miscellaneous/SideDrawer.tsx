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
  Portal,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Icon
} from '@chakra-ui/react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiSearch, FiEdit3 } from "react-icons/fi";
import { ChatState } from './../../Context/ChatProvider';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import NotificationBadge from './NotificationBadge';
import ChangePasswordModal from './ChangePasswordModal';

const SideDrawer: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setUser, setSelectedChat, chats, setChats } = ChatState();
  const history = useHistory();
  const toast = useToast();

  const profileModalDisclosure = useDisclosure();
  
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user?.name || '');
  const [updatedPic, setUpdatedPic] = useState(user?.pic || '');
  const [updating, setUpdating] = useState(false);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push('/');
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast({
        title: 'User not authenticated',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setUpdating(false);
      return;
    }
    
    setUpdating(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/user/update', {
        name: updatedName,
        pic: updatedPic
      }, config);

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));

      toast({
        title: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setUpdating(false);
  };

  const handleCancelEdit = () => {
    setUpdatedName(user?.name || '');
    setUpdatedPic(user?.pic || '');
    setIsEditing(false);
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
      if (!user) {
        toast({
          title: 'User not authenticated',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-left',
        });
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Search for regular users
      const usersResponse = await axios.get(`/api/user?search=${search}`, config);
      
      // Search for admin (hidden from users)
      const adminResult: any[] = [];
      try {
        const adminResponse = await axios.get(`/api/user/search-admin?search=${search}`, config);
        if (adminResponse.data) {
          adminResult.push(adminResponse.data);
        }
      } catch (adminError) {
        // Admin not found, continue with just users
        console.log('Admin not found in search');
      }
      
      const combinedResults = [...usersResponse.data, ...adminResult];
      setLoading(false);
      setSearchResult(combinedResults);
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
    if (!user) {
      toast({
        title: 'User not authenticated',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
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
          <NotificationBadge />

          <Menu isLazy>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              _hover={{ bg: "gray.200" }}
            >
              <Avatar size="sm" cursor="pointer" name={user?.name || 'User'} src={user?.pic || ''} />
            </MenuButton>
            <Portal>
              <MenuList zIndex={9999}>
                <MenuItem onClick={(e) => {
                  e.stopPropagation();
                  profileModalDisclosure.onOpen();
                }}>
                  My Profile
                </MenuItem>
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

      <Modal size='md' isOpen={profileModalDisclosure.isOpen} onClose={profileModalDisclosure.onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" bg="gray.50" boxShadow="2xl" p={4}>
          <ModalHeader
            fontSize={{ base: "2xl", md: "3xl" }}
            fontFamily="Work sans"
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            {isEditing ? 'Edit Profile' : 'My Profile'}
            {!isEditing && (
              <Button
                leftIcon={<Icon as={FiEdit3} />}
                variant="ghost"
                colorScheme="blue"
                size="sm"
                onClick={handleEditClick}
              >
                Edit
              </Button>
            )}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody
            display='flex'
            flexDir='column'
            alignItems='center'
            justifyContent='center'
            gap={5}
            mt={2}
          >
            {isEditing ? (
              <FormControl isRequired mb={4}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  placeholder="Enter your name"
                />
              </FormControl>
            ) : (
              <Box 
                borderRadius="full" 
                overflow="hidden" 
                boxSize="160px" 
                boxShadow="lg"
              >
                <img
                  src={user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                  alt={user?.name || 'User'}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </Box>
            )}

            {isEditing ? (
              <FormControl mb={4}>
                <FormLabel>Profile Picture URL</FormLabel>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<Icon as={FiEdit3} color="gray.300" />}
                  />
                  <Input
                    value={updatedPic}
                    onChange={(e) => setUpdatedPic(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </InputGroup>
              </FormControl>
            ) : (
              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                fontFamily="Work sans"
                color="gray.700"
                textAlign="center"
              >
                Email: {user?.email || 'N/A'}
              </Text>
            )}
            
            {isEditing && (
              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                fontFamily="Work sans"
                color="gray.700"
                textAlign="center"
              >
                Email: {user?.email || 'N/A'} (email cannot be changed)
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            {isEditing ? (
              <>
                <Button 
                  colorScheme='red' 
                  mr={3} 
                  onClick={handleCancelEdit}
                  isDisabled={updating}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme='green' 
                  onClick={handleSaveChanges}
                  isLoading={updating}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Flex direction="column" w="100%" gap={3}>
                <ChangePasswordModal user={user} />
                <Button 
                  colorScheme='blue' 
                  onClick={profileModalDisclosure.onClose}
                  w="100%"
                >
                  Close
                </Button>
              </Flex>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SideDrawer;