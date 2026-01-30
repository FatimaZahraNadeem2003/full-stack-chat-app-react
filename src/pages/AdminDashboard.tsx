import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  SkeletonText,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import UserChatViewer from '../components/Miscellaneous/UserChatViewer';
import AdminChat from '../components/Miscellaneous/AdminChat';

interface User { 
  _id: string; 
  name: string; 
  email: string; 
  pic: string; 
}

interface Chat { 
  _id: string; 
  chatName: string; 
  isGroupChat: boolean; 
  users: User[]; 
  latestMessage?: Message; 
  groupAdmin?: User; 
}

interface Message { 
  _id: string; 
  sender: User; 
  content: string; 
  chat: Chat; 
  createdAt: string; 
}

const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) => (
  <Card>
    <CardBody>
      <Stat>
        <StatLabel display="flex" alignItems="center" gap={2}>
          <span>{icon}</span>
          {title}
        </StatLabel>
        <StatNumber color={`${color}.500`} fontSize="2xl">
          {value}
        </StatNumber>
        <StatHelpText>Current statistics</StatHelpText>
      </Stat>
    </CardBody>
  </Card>
);

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
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}` } };
      const [usersRes, chatsRes] = await Promise.all([
        axios.get<User[]>('/api/admin/users', config),
        axios.get<Chat[]>('/api/admin/chats', config)
      ]);
      setUsers(usersRes.data);
      setChats(chatsRes.data);
      setLoading(false);
    } catch (error: any) {
      toast({ title: 'Error fetching data', status: 'error', duration: 5000, isClosable: true, position: 'bottom' });
      if (error.response?.status === 401) { localStorage.removeItem('adminInfo'); history.push('/admin'); }
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    if (!adminInfo.token) { history.push('/admin'); return; }
    fetchDashboardData();
  }, [history]);

  const handleLogout = () => { localStorage.removeItem('adminInfo'); history.push('/admin'); };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const handleTerminateUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to terminate user ${userName}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}` } };
      await axios.delete(`/api/admin/user/${userId}`, config);
      toast({ title: 'User Terminated', status: 'success', duration: 5000, isClosable: true });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', status: 'error', duration: 5000 });
    }
  };

  const handleViewUserChats = (user: User) => {
    setSelectedUserForChat(user);
  };

  const handleOpenAdminChat = () => {
    setShowAdminChat(true);
  };

  if (selectedUserForChat) {
    return (
      <Box minH="100vh" bg="gray.50">
        <UserChatViewer 
          selectedUser={selectedUserForChat} 
          onClose={() => setSelectedUserForChat(null)} 
        />
      </Box>
    );
  }

  if (showAdminChat) {
    return (
      <Box minH="100vh" bg="gray.50">
        <AdminChat 
          onClose={() => setShowAdminChat(false)} 
        />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box minH="100vh" w="100%" bg="#f8fafc" p={8}>
        <Skeleton height="50px" mb={10} borderRadius="xl" />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={10}>
          {[1, 2, 3].map(i => <Card key={i}><CardBody><SkeletonText noOfLines={4} /></CardBody></Card>)}
        </SimpleGrid>
        <Skeleton height="400px" borderRadius="xl" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" p={0}>
      <Flex justify="space-between" align="center" mb={8} p={8} bg="white">
        <Heading size="lg" color="teal.600">
          Admin Dashboard
        </Heading>
        <Flex gap={3}>
          <Button 
            colorScheme="teal" 
            leftIcon={<ChatIcon />}
            onClick={handleOpenAdminChat}
          >
            Admin Chat
          </Button>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </Flex>

      <Box p={8}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mb={10}>
          <StatCard title="Total Users" value={users.length} icon="👥" color="blue" />
          <StatCard title="Active Chats" value={chats.length} icon="💬" color="teal" />
          <StatCard title="Messages Today" 
            value={chats.filter(chat => chat.latestMessage && new Date(chat.latestMessage.createdAt).toDateString() === new Date().toDateString()).length} 
            icon="✉️" color="purple" 
          />
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>All Users</Tab>
            <Tab>All Chats</Tab>
            <Tab>Recent Activity</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Card>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Registered Users</Heading>
                    <Button 
                      colorScheme="teal" 
                      size="sm"
                      leftIcon={<ChatIcon />}
                      onClick={handleOpenAdminChat}
                    >
                      Open Chat
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Email</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map(user => (
                        <Tr key={user._id}>
                          <Td>
                            <Flex align="center">
                              <Avatar size="sm" src={user.pic} mr={3} />
                              <Text fontWeight="medium">{user.name}</Text>
                            </Flex>
                          </Td>
                          <Td>{user.email}</Td>
                          <Td>
                            <Badge colorScheme="green">Active</Badge>
                          </Td>
                          <Td>
                            <Flex gap={2}>
                              <Button 
                                size="sm" 
                                colorScheme="blue"
                                onClick={() => handleViewUserChats(user)}
                              >
                                View Chats
                              </Button>
                              
                              <Button 
                                size="sm" 
                                colorScheme="red"
                                onClick={() => handleTerminateUser(user._id, user.name)}
                              >
                                Terminate
                              </Button>
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">All Chats</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Chat Name</Th>
                        <Th>Participants</Th>
                        <Th>Type</Th>
                        <Th>Last Message</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {chats.map(chat => (
                        <Tr key={chat._id}>
                          <Td>
                            <Text fontWeight="medium">
                              {chat.isGroupChat ? chat.chatName : 'Private Chat'}
                            </Text>
                          </Td>
                          <Td>
                            <Flex wrap="wrap" gap={1}>
                              {chat.users.slice(0, 3).map(user => (
                                <Avatar key={user._id} size="xs" name={user.name} src={user.pic} />
                              ))}
                              {chat.users.length > 3 && (
                                <Badge>+{chat.users.length - 3}</Badge>
                              )}
                            </Flex>
                          </Td>
                          <Td><Badge variant="solid" colorScheme={chat.isGroupChat ? "purple" : "blue"}>{chat.isGroupChat ? "Group" : "Personal"}</Badge></Td>
                          <Td>
                            {chat.latestMessage ? (
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">
                                  {chat.latestMessage.sender.name}
                                </Text>
                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                  {chat.latestMessage.content}
                                </Text>
                              </Box>
                            ) : (
                              <Text color="gray.500">No messages</Text>
                            )}
                          </Td>
                          <Td>
                            {chat.latestMessage ? (
                              <Text fontSize="sm">
                                {formatDate(chat.latestMessage.createdAt)}
                              </Text>
                            ) : (
                              <Text color="gray.500">-</Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Recent Messages</Heading>
                </CardHeader>
                <CardBody>
                  <Box maxH="500px" overflowY="auto">
                    <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto" pr={2}>
                      {chats
                        .filter(chat => chat.latestMessage)
                        .sort((a, b) => new Date(b.latestMessage!.createdAt).getTime() - new Date(a.latestMessage!.createdAt).getTime())
                        .slice(0, 20)
                        .map(chat => (
                          <Box 
                            key={chat._id} 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="lg"
                            _hover={{ bg: "gray.50" }}
                          >
                            <Flex justify="space-between" mb={2}>
                              <Text fontWeight="bold">
                                {chat.isGroupChat ? chat.chatName : chat.users.map(u => u.name).join(' & ')}
                              </Text>
                              <Badge colorScheme={chat.isGroupChat ? "purple" : "blue"}>
                                {chat.isGroupChat ? "Group" : "Private"}
                              </Badge>
                            </Flex>
                            {chat.latestMessage && (
                              <Box>
                                <Flex align="center" mb={1}>
                                  <Avatar size="xs" src={chat.latestMessage.sender.pic} mr={2} />
                                  <Text fontSize="sm" fontWeight="medium">
                                    {chat.latestMessage.sender.name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" ml={2}>
                                    {formatDate(chat.latestMessage.createdAt)}
                                  </Text>
                                </Flex>
                                <Text fontSize="sm" bg="gray.100" p={2} borderRadius="md">
                                  {chat.latestMessage.content}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        ))}
                    </VStack>
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default AdminDashboard;