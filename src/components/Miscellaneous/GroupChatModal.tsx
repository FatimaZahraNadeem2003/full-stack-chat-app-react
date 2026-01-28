import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, useToast, FormControl, Input, Box, Spinner, VStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios'
import UserListItem from './../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token: string;
}

interface Chat {
  _id: string;
  isGroupChat: boolean;
  users: User[];
  chatName: string;
}

interface GroupChatModalProps {
  children: React.ReactNode;
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({children}) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [search, setSearch] = useState<string>('');
    const [searchResult, setsearchResult] = useState<User[]>([]);
    const [loading, setLoading] = useState(false)
    const toast = useToast();
    const {user, chats, setChats} = ChatState();

    const handleSearch = async (query: string) =>{
      setSearch(query);
      if(!query) return;

      try {
        setLoading(true);
        const config = { headers:{ Authorization: `Bearer ${(user as User).token}` } };
        const {data} = await axios.get<User[]>(`/api/user?search=${query}`, config);
        setsearchResult(data);
        setLoading(false);
      } catch (error: any) {
        toast({
          title: 'Error Occured!',
          description:'Failed to load search results',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position:'bottom-left'
        })
        setLoading(false);
      }
    }

    const handleSubmit = async () =>{
      if(!groupChatName || !selectedUsers){
        toast({
          title: 'Please fill all the fields',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position:'top'
        });
        return;
      }

      try {
        const config = { headers:{ Authorization: `Bearer ${(user as User).token}` } };
        const {data} = await axios.post<Chat>('/api/chat/group',{
          name: groupChatName,
          users:JSON.stringify(selectedUsers.map((u)=> u._id))
        }, config);
        setChats([data, ...chats]);
        onClose();
        toast({
          title: 'New group chat created!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position:'bottom'
        });

      } catch (error: any) {
        toast({
          title: 'Failed to create the chat',
          description: error.response?.data || 'Error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position:'bottom'
        });
      }
    }

    const handleDelete = (delUser: User)=>{
      setSelectedUsers(selectedUsers.filter((sel)=>sel._id !== delUser._id))
    }

    const handleGroup = (userToAdd: User) =>{
      if(selectedUsers.includes(userToAdd)){
        toast({
          title: 'User already added!',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position:'top'
        });
        return;
      }
      setSelectedUsers([...selectedUsers,userToAdd]);
    }

    return (
        <>
          <span onClick={onOpen}>{children}</span>

          <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent borderRadius="xl" bg="gray.50" p={4} boxShadow="xl">
              <ModalHeader
                fontSize='2xl'
                fontFamily='Work sans'
                display='flex'
                justifyContent='center'
              >Create Group Chat</ModalHeader>
              <ModalCloseButton />
              <ModalBody display='flex' flexDir='column' alignItems='center'>

                <FormControl mb={3}>
                    <Input 
                      placeholder='Chat Name' 
                      value={groupChatName}
                      onChange={(e)=> setGroupChatName(e.target.value)}
                      borderRadius="md"
                      focusBorderColor="blue.400"
                      boxShadow="sm"
                    />
                </FormControl>

                <FormControl mb={3}>
                    <Input 
                      placeholder='Add Users eg: example, ali, ahmad' 
                      value={search}
                      onChange={(e)=> handleSearch(e.target.value)}
                      borderRadius="md"
                      focusBorderColor="blue.400"
                      boxShadow="sm"
                    />
                </FormControl>

                <Box w='100%' display='flex' flexWrap='wrap' mb={3}>
                  {selectedUsers.map(u=>(
                    <UserBadgeItem 
                      key={u._id} 
                      user={u} 
                      handleFunction={()=> handleDelete(u)}
                    />
                  ))}
                </Box>

                <VStack w="100%" spacing={2} maxH="200px" overflowY="auto">
                  {loading ? <Spinner /> : (
                    searchResult?.slice(0,4).map(user=>(
                      <UserListItem 
                        key={user._id} 
                        user={user} 
                        handleFunction={()=> handleGroup(user)}
                      />
                    ))
                  )}
                  {search && !loading && searchResult.length === 0 && (
                    <Text color="gray.500" textAlign="center" fontSize="sm">No users found</Text>
                  )}
                </VStack>

              </ModalBody>

              <ModalFooter>
                <Button 
                  colorScheme='blue' 
                  w="100%" 
                  onClick={handleSubmit}
                  _hover={{ bg: "blue.500", transform: "scale(1.02)" }}
                  boxShadow="md"
                  borderRadius="md"
                >
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default GroupChatModal
