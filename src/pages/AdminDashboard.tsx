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
  VStack,
  Container
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
  <Card shadow="sm" border="1px solid" borderColor="gray.100">
    <CardBody>
      <Stat>
        <StatLabel display="flex" alignItems="center" gap={2} fontSize="md" fontWeight="bold" color="gray.600">
          <span>{icon}</span>
          {title}
        </StatLabel>
        <StatNumber color={`${color}.500`} fontSize="3xl" fontWeight="extrabold">
          {value}
        </StatNumber>
        <StatHelpText mb={0}>Current statistics</StatHelpText>
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

  if (selectedUserForChat) {
    return (
      <Box minH="100vh" w="100%" bg="gray.50">
        <UserChatViewer 
          selectedUser={selectedUserForChat} 
          onClose={() => setSelectedUserForChat(null)} 
        />
      </Box>
    );
  }

  if (showAdminChat) {
    return (
      <Box minH="100vh" w="100%" bg="gray.50">
        <AdminChat 
          onClose={() => setShowAdminChat(false)} 
        />
      </Box>
    );
  }

  return (
    <Box minH="100vh" w="100vw" bg="gray.50" overflowX="hidden">
      <Flex 
        justify="space-between" 
        align="center" 
        p={6} 
        bg="white" 
        borderBottom="1px solid" 
        borderColor="gray.200"
        boxShadow="sm"
        w="100%"
      >
        <Heading size="lg" color="teal.600" fontWeight="bold">
          Admin Dashboard
        </Heading>
        <Flex gap={3}>
          <Button colorScheme="red" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </Flex>

      <Box p={{ base: 4, md: 8 }} w="100%" maxW="100%">
        
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mb={10}>
          <StatCard title="Total Users" value={users.length} icon="👥" color="blue" />
          <StatCard title="Active Chats" value={chats.length} icon="💬" color="teal" />
          <StatCard 
            title="Messages Today" 
            value={chats.filter(chat => 
              chat.latestMessage && 
              new Date(chat.latestMessage.createdAt).toDateString() === new Date().toDateString()
            ).length} 
            icon="✉️" 
            color="purple" 
          />
        </SimpleGrid>

        <Tabs variant="line" colorScheme="teal" isLazy>
          <TabList mb="1em" borderBottomWidth="2px">
            <Tab fontWeight="bold" fontSize="lg">All Users</Tab>
            <Tab fontWeight="bold" fontSize="lg">All Chats</Tab>
            <Tab fontWeight="bold" fontSize="lg">Recent Activity</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Card variant="outline" boxShadow="sm" borderRadius="lg">
                <CardHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
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
                <CardBody p={0} overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>USER</Th>
                        <Th>EMAIL</Th>
                        <Th>STATUS</Th>
                        <Th>ACTIONS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map(user => (
                        <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <Flex align="center">
                              <Avatar size="sm" src={user.pic} mr={3} border="1px solid" borderColor="gray.200" />
                              <Text fontWeight="bold">{user.name}</Text>
                            </Flex>
                          </Td>
                          <Td>{user.email}</Td>
                          <Td>
                            <Badge colorScheme="green" variant="subtle" px={2} borderRadius="full">
                              ACTIVE
                            </Badge>
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
                                variant="solid"
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

            <TabPanel p={0}>
              <Card variant="outline" boxShadow="sm">
                <CardHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                  <Heading size="md">All Active Chats</Heading>
                </CardHeader>
                <CardBody p={0} overflowX="auto">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>CHAT NAME</Th>
                        <Th>PARTICIPANTS</Th>
                        <Th>TYPE</Th>
                        <Th>LAST MESSAGE</Th>
                        <Th>TIME</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {chats.map(chat => (
                        <Tr key={chat._id} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <Text fontWeight="bold">
                              {chat.isGroupChat ? chat.chatName : 'Private Chat'}
                            </Text>
                          </Td>
                          <Td>
                            <Flex wrap="wrap" gap={1}>
                              {chat.users.slice(0, 3).map(user => (
                                <Avatar key={user._id} size="xs" name={user.name} src={user.pic} />
                              ))}
                              {chat.users.length > 3 && (
                                <Badge borderRadius="full">+{chat.users.length - 3}</Badge>
                              )}
                            </Flex>
                          </Td>
                          <Td>
                            <Badge variant="solid" colorScheme={chat.isGroupChat ? "purple" : "blue"}>
                              {chat.isGroupChat ? "GROUP" : "PERSONAL"}
                            </Badge>
                          </Td>
                          <Td maxW="200px">
                            {chat.latestMessage ? (
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="gray.700">
                                  {chat.latestMessage.sender.name}:
                                </Text>
                                <Text fontSize="xs" color="gray.600" isTruncated>
                                  {chat.latestMessage.content}
                                </Text>
                              </Box>
                            ) : (
                              <Text color="gray.400" fontSize="xs">No messages yet</Text>
                            )}
                          </Td>
                          <Td fontSize="xs" color="gray.500">
                            {chat.latestMessage ? formatDate(chat.latestMessage.createdAt) : '-'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel p={0}>
              <Card variant="outline" boxShadow="sm">
                <CardHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                  <Heading size="md">Recent Messages Stream</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch" maxH="70vh" overflowY="auto" pr={2}>
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
                          bg="white"
                          transition="all 0.2s"
                          _hover={{ bg: "gray.50", shadow: "sm" }}
                        >
                          <Flex justify="space-between" mb={2} align="center">
                            <Text fontWeight="bold" color="teal.700">
                              {chat.isGroupChat ? `Group: ${chat.chatName}` : `Private: ${chat.users.map(u => u.name).join(' & ')}`}
                            </Text>
                            <Badge variant="outline" fontSize="2xs">
                              {formatDate(chat.latestMessage!.createdAt)}
                            </Badge>
                          </Flex>
                          <Flex align="center" gap={3}>
                            <Avatar size="xs" src={chat.latestMessage!.sender.pic} />
                            <Box flex="1" bg="gray.50" p={2} borderRadius="md" borderLeft="4px solid" borderColor="teal.400">
                              <Text fontSize="sm" fontWeight="bold" mb={1}>{chat.latestMessage!.sender.name}</Text>
                              <Text fontSize="sm" color="gray.700">{chat.latestMessage!.content}</Text>
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                  </VStack>
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