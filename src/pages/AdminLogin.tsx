import React, { useState } from 'react';
import { 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  InputGroup, 
  InputRightElement, 
  VStack, 
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text
} from '@chakra-ui/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const AdminLogin = () => {
  const [show, setShow] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();

  const handleClick = () => setShow(!show);
  const handleRegisterClick = () => setShowRegister(!showRegister);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: 'Please Fill all the Fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json'
        }
      };

      const { data } = await axios.post(
        '/api/admin/login',
        { email, password },
        config
      );

      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });

      localStorage.setItem('adminInfo', JSON.stringify(data));
      setLoading(false);
      history.push('/admin/dashboard');
    } catch (error) {
      const err = error as any;
      toast({
        title: 'Error Occurred!',
        description: err.response?.data?.message || 'Failed to login',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      setLoading(false);
    }
  };

  const registerHandler = async () => {
    setLoading(true);
    if (!name || !email || !password) {
      toast({
        title: 'Please Fill all the Fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json'
        }
      };

      const { data } = await axios.post(
        '/api/admin/register',
        { name, email, password },
        config
      );

      toast({
        title: 'Registration Successful',
        description: 'You can now login with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });

      localStorage.setItem('adminInfo', JSON.stringify(data));
      setLoading(false);
      history.push('/admin/dashboard');
    } catch (error) {
      const err = error as any;
      toast({
        title: 'Error Occurred!',
        description: err.response?.data?.message || 'Failed to register',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing='5px' color='black' maxWidth="400px" margin="auto" mt={20}>
      <Text fontSize="2xl" fontWeight="bold" color="teal.600" mb={6}>
        Admin Panel
      </Text>
      
      <Tabs width="100%" colorScheme="teal">
        <TabList>
          <Tab>Login</Tab>
          <Tab>Register</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing='5px'>
              <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  value={email}
                  type='email'
                  placeholder='Enter Your Email Address'
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              
              <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={show ? 'text' : 'password'}
                    placeholder='Enter Password'
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                      {show ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                colorScheme='blue'
                width='100%'
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
              >
                Login
              </Button>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing='5px'>
              <FormControl id='name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  type='text'
                  placeholder='Enter Your Name'
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl id='reg-email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  value={email}
                  type='email'
                  placeholder='Enter Your Email Address'
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              
              <FormControl id='reg-password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showRegister ? 'text' : 'password'}
                    placeholder='Enter Password'
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleRegisterClick}>
                      {showRegister ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                colorScheme='green'
                width='100%'
                style={{ marginTop: 15 }}
                onClick={registerHandler}
                isLoading={loading}
              >
                Register
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default AdminLogin;