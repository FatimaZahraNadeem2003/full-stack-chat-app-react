import React, { useEffect, useState } from 'react';
import {
  Box, Flex, Heading, Text, Card, CardBody, Avatar, Button, useToast, Tabs, TabList,
  TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Badge, Skeleton,
  SkeletonText, SimpleGrid, VStack, Icon, HStack, IconButton
} from '@chakra-ui/react';
import { ChatIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { FiUsers, FiMessageSquare, FiSend, FiLogOut, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import UserChatViewer from './UserChatViewer';
import AdminChat from './AdminChat';

interface User { _id: string; name: string; email: string; pic: string; }
interface Chat { _id: string; chatName: string; isGroupChat: boolean; users: User[]; latestMessage?: Message; groupAdmin?: User; }
interface Message { _id: string; sender: User; content: string; chat: Chat; createdAt: string; }

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [showAdminChat, setShowAdminChat] = useState(false);
  
  const toast = useToast();
  const history = useHistory();

  const fetchDashboardData = async () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      
      const [usersRes, chatsRes] = await Promise.all([
        axios.get<User[]>('/api/admin/users', config),
        axios.get<Chat[]>('/api/admin/chats', config)
      ]);
      
      setUsers(usersRes.data);
      setChats(chatsRes.data);
      setLoading(false);
    } catch (error: any) {
      toast({ title: 'Error', status: 'error', duration: 5000, position: 'bottom' });
      if (error.response?.status === 401) {
        localStorage.removeItem('adminInfo');
        history.push('/admin');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    if (!adminInfo.token) {
      history.push('/admin');
      return;
    }
    fetchDashboardData();
  }, [history]);

  const handleViewUserChats = (user: User) => {
    setSelectedUserForChat(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    history.push('/admin');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const handleTerminateUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Terminate ${userName}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}` } };
      await axios.delete(`/api/admin/user/${userId}`, config);
      toast({ title: 'Success', status: 'success' });
      fetchDashboardData();
    } catch (error) { toast({ title: 'Error', status: 'error' }); }
  };

  if (selectedUserForChat) return <Box w="100vw" h="100vh"><UserChatViewer selectedUser={selectedUserForChat} onClose={() => setSelectedUserForChat(null)} /></Box>;
  if (showAdminChat) return <Box w="100vw" h="100vh"><AdminChat onClose={() => setShowAdminChat(false)} /></Box>;

  return (
    <Box 
      w="100vw" 
      minH="100vh" 
      bg="#F4F7FE" 
      ml="calc(-50vw + 50%)" 
      position="relative"
      overflowX="hidden"
    >
      <Flex 
        w="100%" bg="white" px={{ base: 4, md: 12 }} py={4} 
        justify="space-between" align="center" boxShadow="sm"
        position="sticky" top="0" zIndex="100"
      >
        <HStack spacing={3}>
          <Icon as={FiShield} w={8} h={8} color="teal.500" />
          <Heading size="md" bgGradient="linear(to-r, teal.600, blue.600)" bgClip="text">ADMIN CONTROL</Heading>
        </HStack>

        <HStack spacing={4}>
          <Button leftIcon={<ChatIcon />} colorScheme="teal" borderRadius="full" onClick={() => setShowAdminChat(true)}>Admin Chat</Button>
          <Button variant="ghost" leftIcon={<FiLogOut />} color="red.500" onClick={handleLogout}>Logout</Button>
        </HStack>
      </Flex>

      <Box p={{ base: 4, md: 10 }}>
        {loading ? (
          <Skeleton height="80vh" borderRadius="3xl" />
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mb={10}>
              <StatCard icon={FiUsers} label="Total Users" value={users.length} color="blue" />
              <StatCard icon={FiMessageSquare} label="Total Chats" value={chats.length} color="teal" />
              <StatCard icon={FiSend} label="Messages Today" 
                value={chats.filter(c => c.latestMessage && new Date(c.latestMessage.createdAt).toDateString() === new Date().toDateString()).length} 
                color="purple" 
              />
            </SimpleGrid>

            <Box bg="white" borderRadius="3xl" boxShadow="xl" p={{ base: 4, md: 8 }}>
              <Tabs variant="soft-rounded" colorScheme="teal">
                <TabList mb={8} bg="gray.50" p={2} borderRadius="2xl" display="inline-flex">
                  <Tab fontWeight="bold" px={8}>User List</Tab>
                  <Tab fontWeight="bold" px={8}>System Chats</Tab>
                  <Tab fontWeight="bold" px={8}>Activity</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={0}>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead bg="gray.50"><Tr><Th>USER</Th><Th>EMAIL</Th><Th>STATUS</Th><Th textAlign="right">ACTIONS</Th></Tr></Thead>
                        <Tbody>
                          {users.map(u => (
                            <Tr key={u._id} _hover={{ bg: "gray.50" }}>
                              <Td><Flex align="center"><Avatar size="sm" src={u.pic} mr={3} /><Text fontWeight="bold">{u.name}</Text></Flex></Td>
                              <Td color="gray.500">{u.email}</Td>
                              <Td><Badge colorScheme="green" borderRadius="full" px={3}>Active</Badge></Td>
                              <Td textAlign="right">
                                <HStack justify="flex-end">
                                  <Button size="xs" leftIcon={<ViewIcon />} colorScheme="blue" onClick={() => handleViewUserChats(u)}>View</Button>
                                  <Button size="xs" leftIcon={<DeleteIcon />} colorScheme="red" onClick={() => handleTerminateUser(u._id, u.name)}>Ban</Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  <TabPanel p={0}>
                     <Table variant="simple">
                        <Thead><Tr><Th>CHAT NAME</Th><Th>TYPE</Th><Th>LAST MSG</Th></Tr></Thead>
                        <Tbody>
                          {chats.map(c => (
                            <Tr key={c._id}>
                              <Td fontWeight="bold">{c.isGroupChat ? c.chatName : 'Direct'}</Td>
                              <Td><Badge colorScheme={c.isGroupChat ? "purple" : "blue"}>{c.isGroupChat ? "GROUP" : "P2P"}</Badge></Td>
                              <Td fontSize="xs" color="gray.500">{c.latestMessage?.content || '-'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                     </Table>
                  </TabPanel>

                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch">
                      {chats.filter(c => c.latestMessage).slice(0, 5).map(c => (
                        <Box key={c._id} p={4} bg="gray.50" borderRadius="xl">
                          <Text fontSize="xs" fontWeight="bold" color="teal.600">{c.latestMessage?.sender.name} sent a message:</Text>
                          <Text fontSize="sm">{c.latestMessage?.content}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <Card borderRadius="2xl" shadow="md" borderTop="4px solid" borderColor={`${color}.400`}>
    <CardBody p={6} display="flex" alignItems="center">
      <Box p={4} borderRadius="xl" bg={`${color}.50`} mr={4}><Icon as={icon} w={6} h={6} color={`${color}.500`} /></Box>
      <Box><Text color="gray.500" fontSize="xs" fontWeight="bold">{label}</Text><Heading size="lg">{value}</Heading></Box>
    </CardBody>
  </Card>
);

export default AdminDashboard;