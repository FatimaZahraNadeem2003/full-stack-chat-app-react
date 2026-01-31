import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Icon,
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import { ChatState, User } from '../../Context/ChatProvider'
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserFriends,
} from 'react-icons/fa'



const Login: React.FC = () => {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const toast = useToast()
  const history = useHistory()
  const { setUser } = ChatState()

  const bgCard = useColorModeValue('whiteAlpha.900', 'whiteAlpha.100')

  const handleClick = () => setShow(!show)

  const submitHandler = async () => {
    setLoading(true)
    if (!email || !password) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      setLoading(false)
      return
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      }

      const { data } = await axios.post<User>(
        '/api/user/login',
        { email, password },
        config
      )

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })

      setUser(data)
      localStorage.setItem('userInfo', JSON.stringify(data))
      setLoading(false)
      history.push('/chats')
    } catch (error: any) {
      toast({
        title: 'Error Occured!',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      const response = await axios.post('/api/user/guest', {}, config);

      toast({
        title: 'Guest login successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      setUser(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      setLoading(false);
      history.push('/chats');
    } catch (error: any) {
      toast({
        title: 'Error logging in as guest!',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  }

  return (
    <Box
      w="100%"
      maxW="420px"
      mx="auto"
      p={8}
      borderRadius="2xl"
      bg={bgCard}
      boxShadow="0 20px 40px rgba(0,0,0,0.25)"
      backdropFilter="blur(12px)"
    >
      <VStack spacing={6} color="gray.800">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            Welcome Back 👋
          </Text>
          <Text fontSize="sm" color="gray.500">
            Login to continue chatting
          </Text>
        </Box>

        <FormControl id="email" isRequired>
          <FormLabel fontWeight="600">
            <Icon as={FaEnvelope} mr={2} color="purple.500" />
            Email Address
          </FormLabel>
          <Input
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            size="lg"
            borderRadius="xl"
            focusBorderColor="purple.400"
            bg="white"
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel fontWeight="600">
            <Icon as={FaLock} mr={2} color="purple.500" />
            Password
          </FormLabel>

          <InputGroup size="lg">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              borderRadius="xl"
              focusBorderColor="purple.400"
              bg="white"
            />
            <InputRightElement>
              <Button
                variant="ghost"
                onClick={handleClick}
                _hover={{ bg: 'purple.50' }}
              >
                <Icon as={show ? FaEyeSlash : FaEye} />
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          w="100%"
          size="lg"
          isLoading={loading}
          onClick={submitHandler}
          leftIcon={<Icon as={FaSignInAlt} />}
          bgGradient="linear(to-r, purple.500, pink.500)"
          color="white"
          borderRadius="xl"
          _hover={{
            bgGradient: 'linear(to-r, purple.600, pink.600)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="0.2s"
        >
          Login 🚀
        </Button>

        <Button
          variant="outline"
          colorScheme="purple"
          w="100%"
          size="lg"
          leftIcon={<Icon as={FaUserFriends} />}
          borderRadius="xl"
          onClick={handleGuestLogin}
          isLoading={loading}
        >
          Try Guest Account 🎉
        </Button>
      </VStack>
    </Box>
  )
}

export default Login
