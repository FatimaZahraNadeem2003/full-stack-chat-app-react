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
  Input,
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import UserChatViewer from '../components/Miscellaneous/UserChatViewer';
import AdminChat from '../components/Miscellaneous/AdminChat';
import MonitorChat from '../components/Miscellaneous/MonitorChat';


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
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [showAdminChat, setShowAdminChat] = useState(false);

  const [userSearchTerm, setUserSearchTerm] = useState('');

  const toastChakra = useToast();
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
      toastChakra({ title: 'Error fetching data', status: 'error', duration: 5000, isClosable: true, position: 'bottom' });
      if (error.response?.status === 401) {
        localStorage.removeItem('adminInfo');
        history.push('/admin');
      }
      setLoading(false);
    }
  };

  const fetchTotalMessagesCount = async (): Promise<number> => {
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}` } };
      const chatsRes = await axios.get<Chat[]>('/api/admin/chats', config);
      const allChats = chatsRes.data;
      
      let totalMessages = 0;
      for (const chat of allChats) {
        try {
          const messagesRes = await axios.get<Message[]>(`/api/admin/chat/${chat._id}/messages`, config);
          totalMessages += messagesRes.data.length;
        } catch (err) {
          console.error(`Error fetching messages for chat ${chat._id}:`, err);
        }
      }
      
      return totalMessages;
    } catch (error: any) {
      console.error('Error fetching total messages:', error);
      return 0; 
    }
  };

  const getTotalMessagesCount = async () => {
    return await fetchTotalMessagesCount();
  };

  useEffect(() => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    if (!adminInfo.token) {
      history.push('/admin');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      
      setLoadingStats(true);
      const msgCount = await fetchTotalMessagesCount();
      setMessagesCount(msgCount);
      setLoadingStats(false);
      setLoading(false);
    };
    
    loadData();
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    history.push('/admin');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();


  const handleTerminateUser = (userId: string, userName: string) => {
    toast.custom((t: Toast) => (
      <Box
        bg="white"
        p={4}
        borderRadius="lg"
        boxShadow="lg"
        width="320px"
      >
        <Text fontWeight="bold" mb={2}>
          Are you sure you want to terminate user?
        </Text>

        <Text fontSize="sm" color="gray.600" mb={4}>
          User: <strong>{userName}</strong>
        </Text>

        <Flex justify="flex-end" gap={3}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            colorScheme="red"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const config = {
                  headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminInfo') || '{}').token}`,
                  },
                };
                await axios.delete(`/api/admin/user/${userId}`, config);
                toast.success('User terminated successfully');
                fetchDashboardData();
              } catch (error) {
                toast.error('Failed to terminate user');
              }
            }}
          >
            Terminate
          </Button>
        </Flex>
      </Box>
    ));
  };


  if (loading) {
    return (
      <Box minH="100vh" w="100%" bg="#f8fafc" p={{ base: 4, md: 8 }}>
        <Skeleton height="50px" mb={6} borderRadius="xl" />
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={{ base: 3, md: 6 }} mb={{ base: 4, md: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardBody>
                <SkeletonText noOfLines={4} />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        <Skeleton height={{ base: '200px', md: '400px' }} borderRadius="xl" />
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
        <AdminChat onClose={() => setShowAdminChat(false)} />
      </Box>
    );
  }


  return (
    <Box minH="100vh" w="100vw" bg="gray.50" overflowX="hidden">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align="center"
        p={{ base: 4, md: 6 }}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        gap={{ base: 4, md: 0 }}
      >
        <Heading size={{ base: 'md', md: 'lg' }} color="teal.600" fontWeight="bold">
          Admin Dashboard
        </Heading>
        <Flex gap={{ base: 2, md: 3 }} wrap="wrap" justify="center">
          <Button colorScheme="teal" onClick={() => setShowAdminChat(true)}>
            New Chat
          </Button>
          <Button colorScheme="red" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </Flex>
      
      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={{ base: 3, sm: 4, md: 5, lg: 6 }} mb={{ base: 4, md: 8 }}>
          <StatCard 
            title="Total Users" 
            value={users.length} 
            color="blue" 
            icon="👥" 
          />
          <StatCard 
            title="Total Chats" 
            value={chats.length} 
            color="green" 
            icon="💬" 
          />
          <StatCard 
            title="Total Messages" 
            value={messagesCount} 
            color="teal" 
            icon="📝" 
          />
          <StatCard 
            title="Active Admin" 
            value={1} 
            color="purple" 
            icon="👤" 
          />
        </SimpleGrid>
        
        <Tabs isFitted variant="enclosed" mt={{ base: 4, md: 8 }}>
          <TabList mb="-px">
            <Tab>User Management</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={{ base: 2, md: 4 }}>
              <Card>
                <CardHeader>
                  <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={{ base: 3, md: 0 }}>
                    <Heading size="md" mb={{ base: 2, md: 0 }}>Users</Heading>
                    <Input
                      placeholder="Search users..."
                      w={{ base: '100%', md: '300px' }}
                      value={userSearchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearchTerm(e.target.value)}
                    />
                  </Flex>
                </CardHeader>
                <CardBody maxH={{ base: '300px', md: '500px' }} overflowY="auto">
                  <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th display={{ base: 'none', md: 'table-cell' }}>Email</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users
                        .filter(user => 
                          user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                        )
                        .map(user => (
                          <Tr key={user._id}>
                            <Td>
                              <Flex align="center" gap={3}>
                                <Avatar size="sm" src={user.pic} name={user.name} />
                                <Text fontWeight="medium">{user.name}</Text>
                              </Flex>
                            </Td>
                            <Td display={{ base: 'none', md: 'table-cell' }}>{user.email}</Td>
                            <Td>
                              <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 2 }}>
                                <Button 
                                  size={{ base: 'sm', md: 'sm' }}
                                  colorScheme="blue" 
                                  w={{ base: '100%', md: 'auto' }}
                                  onClick={() => {
                                    setSelectedUserForChat(user);
                                  }}
                                >
                                  View Chats
                                </Button>
                                <Button 
                                  size={{ base: 'sm', md: 'sm' }}
                                  colorScheme="red" 
                                  w={{ base: '100%', md: 'auto' }}
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
              <Box overflowX="auto">
                {/* Table content will be here */}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
