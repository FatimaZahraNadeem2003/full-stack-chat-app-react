import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast, HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios'
import UserListItem from './../UserAvatar/UserListItem';

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
  groupAdmin: User;
}

interface UpdateGroupChatModalProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  fetchMessages: () => void;
}

const UpdateGroupChatModal: React.FC<UpdateGroupChatModalProps> = ({fetchAgain, setFetchAgain, fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [searchReslut, setSearchResult] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const {selectedChat, setSelectedChat, user} = ChatState();
    const toast = useToast();

    const handleRemove = async(user1: User) => {
        if((selectedChat as Chat).groupAdmin._id !== (user as User)._id && user1._id !== (user as User)._id){
            toast({
                title: 'Only admins can remove someone!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom'
            });
            return;
        } 
        try {
            setLoading(true);
            const config = { headers:{ Authorization: `Bearer ${(user as User).token}` } };
            const {data} = await axios.put<Chat>('/api/chat/groupremove',{
                chatId: (selectedChat as Chat)._id,
                userId: user1._id
            }, config);
            user1._id === (user as User)._id ? setSelectedChat(''): setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom'
            });
            setLoading(false);
        }
    }

    const handleRename = async() => {
        if(!groupChatName) return
        try {
            setRenameLoading(true)
            const config = { headers:{ Authorization: `Bearer ${(user as User).token}` } };
            const {data} = await axios.put<Chat>('/api/chat/rename',{
                chatId: (selectedChat as Chat)._id,
                chatName: groupChatName
            }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description:error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom'
            });
            setRenameLoading(false);
        }
        setGroupChatName('');
    }

    const handleSearch = async (query: string) =>{
        setSearch(query);
        if(!query) return;
        try {
            setLoading(true);
            const config = { headers:{ Authorization: `Bearer ${(user as User).token}` } };
            const {data} = await axios.get<User[]>(`/api/user?search=${search}`,config);
            setLoading(false);
            setSearchResult(data);
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description:'Failed to load search results',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom-left'
            });
            setLoading(false);
        }
    }

    const handleAddUser = async (user1: User) => {
        if((selectedChat as Chat).users.find((u)=> u._id === user1._id)){
            toast({
                title: 'User Already in group!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom'
            });
            return;
        }
        if((selectedChat as Chat).groupAdmin._id !== (user as User)._id){
            toast({
                title: 'Only admins can add someone!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom'
            });
            return;
        }
        try {
            setLoading(true);
            const config = { headers:{ Authorization: `Bearer ${(user as User).token}` } };
            const {data} = await axios.put<Chat>('/api/chat/groupadd',{
                chatId: (selectedChat as Chat)._id,
                userId: user1._id
            }, config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position:'bottom'
            });
        }
    }

    const handleDeleteGroup = async () => {
        if ((selectedChat as Chat).groupAdmin._id !== (user as User)._id) {
            toast({
                title: 'Only group admin can delete the group!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            return;
        }

        try {
            await axios.delete('/api/chat/groupdelete', {
                data: { chatId: (selectedChat as Chat)._id },
                headers: { Authorization: `Bearer ${(user as User).token}` }
            });
            
            toast({
                title: 'Group deleted successfully!',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            
            setSelectedChat('');
            setFetchAgain(!fetchAgain);
            onClose();
        } catch (error: any) {
            toast({
                title: 'Error Occured!',
                description: error.response?.data?.message || 'Failed to delete group',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }
    };

    const isAdmin = (selectedChat as Chat).groupAdmin._id === (user as User)._id;

    return (
        <>
          <IconButton
            display={{base:'flex'}}
            icon={<ViewIcon/>}
            onClick={onOpen}
            aria-label="Update Group Chat"
            colorScheme="blue"
            _hover={{ transform: "scale(1.1)" }}
          />

          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="xl" boxShadow="2xl" bg="gray.50">
              <ModalHeader
                fontSize={{ base: "2xl", md: "3xl" }}
                fontFamily='Work sans'
                display='flex'
                justifyContent='center'
                bgGradient="linear(to-r, purple.500, blue.400)"
                bgClip="text"
              >
                {(selectedChat as Chat).chatName}
              </ModalHeader>
              <ModalCloseButton />

              <ModalBody display="flex" flexDir="column" gap={4}>
                <Box w='100%' display='flex' flexWrap='wrap' gap={2} pb={3}>
                  {(selectedChat as Chat).users.map((u)=>(
                    <UserBadgeItem key={u._id} user={u} handleFunction={()=> handleRemove(u)} />
                  ))}
                </Box>

                {isAdmin && (
                  <>
                    <FormControl display='flex' gap={2}>
                      <Input
                        placeholder='Chat Name'
                        value={groupChatName}
                        onChange={(e)=>setGroupChatName(e.target.value)}
                        borderRadius="md"
                        focusBorderColor="blue.400"
                      />
                      <Button
                        colorScheme='teal'
                        isLoading={renameLoading}
                        onClick={handleRename}
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        Update
                      </Button>
                    </FormControl>

                    <FormControl>
                      <Input
                        placeholder='Add User to group'
                        value={search}
                        onChange={(e)=> handleSearch(e.target.value)}
                        borderRadius="md"
                        focusBorderColor="blue.400"
                      />
                    </FormControl>

                    {loading ? (
                      <Spinner size='lg' display="flex" m="auto" />
                    ) : (
                      searchReslut?.map((user)=>(
                        <UserListItem key={user._id} user={user} handleFunction={()=> handleAddUser(user)} />
                      ))
                    )}
                  </>
                )}

                {!isAdmin && (
                  <Box textAlign="center" py={4}>
                    <Text fontSize="sm" color="gray.600">
                      Only group admin can manage group settings
                    </Text>
                  </Box>
                )}
              </ModalBody>

              <ModalFooter justifyContent="space-between">
                <Button
                  colorScheme='red'
                  onClick={()=> handleRemove(user as User)}
                  _hover={{ transform: "scale(1.05)" }}
                >
                  Leave Group
                </Button>
                
                {isAdmin && (
                  <Button
                    colorScheme='red'
                    variant='outline'
                    onClick={handleDeleteGroup}
                    _hover={{ transform: "scale(1.05)" }}
                  >
                    Delete Group
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
    )
}

export default UpdateGroupChatModal
