import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { FaComments, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useHistory } from 'react-router-dom';

const HomePage: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (user) history.push('/chats');
  }, [history]);

  return (
    <Container maxW="container.lg" centerContent py={8}>
      <VStack spacing={6} mb={8}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="whiteAlpha.900"
          p={6}
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="purple.200"
          boxShadow="xl"
          backdropFilter="blur(10px)"
          transform="translateY(-10px)"
          transition="all 0.3s ease"
          _hover={{ transform: 'translateY(-15px)', boxShadow: '2xl' }}
        >
          <Icon as={FaComments} w={10} h={10} color="purple.500" mr={3} />
          <Text
            fontSize={{ base: '3xl', md: '4xl' }}
            fontFamily="Poppins"
            fontWeight="extrabold"
            color="purple.700"
          >
            Chat App <span style={{ fontSize: '2rem' }}>💬</span>
          </Text>
        </Box>
      </VStack>

      <Box
        bg="whiteAlpha.900"
        w="100%"
        p={8}
        borderRadius="2xl"
        borderWidth="2px"
        borderColor="purple.200"
        boxShadow="xl"
        backdropFilter="blur(10px)"
      >
        <Tabs variant="soft-rounded" colorScheme="purple">
          <TabList justifyContent="center" mb={4}>
            <Tab
              w={{ base: '40%', md: '45%' }}
              mx={2}
              py={3}
              borderRadius="xl"
              fontWeight="bold"
              _selected={{ bg: 'purple.500', color: 'white' }}
              _hover={{ bg: 'purple.300', color: 'white' }}
            >
              <Icon as={FaSignInAlt} mr={2} />
              Login
            </Tab>
            <Tab
              w={{ base: '40%', md: '45%' }}
              mx={2}
              py={3}
              borderRadius="xl"
              fontWeight="bold"
              _selected={{ bg: 'purple.500', color: 'white' }}
              _hover={{ bg: 'purple.300', color: 'white' }}
            >
              <Icon as={FaUserPlus} mr={2} />
              Sign Up
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
