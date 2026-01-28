import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, Box, Heading, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

interface CloudinaryResponse {
  url: string;
}

const Signup: React.FC = () => {
  const toast = useToast()
  const history = useHistory();

  const [show, setShow] = useState(false)
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmpassword, setConfirmpassword] = useState<string>('');
  const [pic, setPic] = useState<string>('');
  const [loading, setLoading] = useState(false)

  const handleClick = () => setShow(!show);

  const postDetails = (pics: File) => {
    setLoading(true);

    if (!pics) {
      toast({
        title: 'Please select an Image',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false);
      return;
    }

    if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
      const data = new FormData();
      data.append("file", pics);
      data.append('upload_preset', 'chat-app');
      data.append('cloud_name', 'dagow0fxu');

      fetch('https://api.cloudinary.com/v1_1/dagow0fxu/image/upload', {
        method: 'post',
        body: data
      })
        .then(res => res.json())
        .then((data: CloudinaryResponse) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: 'Please select an Image',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false);
    }
  }

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !confirmpassword) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: 'Password not match',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { "Content-Type": "application/json" } }
      const { data } = await axios.post("/api/user", { name, email, password, pic }, config);

      toast({
        title: 'Registration Successfull',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })

      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      history.push('/chats')

    } catch (error: any) {
      toast({
        title: 'Error occured!',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false);
    }
  }

  return (
    <Box
      w={{ base: "90%", md: "400px" }}
      p={8}
      m="auto"
      mt={10}
      borderRadius="xl"
      boxShadow="lg"
      bg="white"
    >
      <Heading mb={6} textAlign="center" color="blue.600">Sign Up</Heading>
      <VStack spacing={4} color='black'>
        <FormControl id='first-name' isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder='Enter your name'
            onChange={(event) => setName(event.target.value)}
            focusBorderColor="blue.400"
            borderRadius="md"
            boxShadow="sm"
          />
        </FormControl>

        <FormControl id='email' isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder='Enter your email'
            onChange={(event) => setEmail(event.target.value)}
            focusBorderColor="blue.400"
            borderRadius="md"
            boxShadow="sm"
          />
        </FormControl>

        <FormControl id='password' isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup size='md'>
            <Input
              type={show ? "text" : "password"}
              placeholder='Password'
              onChange={(event) => setPassword(event.target.value)}
              focusBorderColor="blue.400"
              borderRadius="md"
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id='confirm-password' isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup size='md'>
            <Input
              type={show ? "text" : "password"}
              placeholder='Confirm Password'
              onChange={(e) => setConfirmpassword(e.target.value)}
              focusBorderColor="blue.400"
              borderRadius="md"
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id='pic'>
          <FormLabel>Upload your picture</FormLabel>
          <Input
            type='file'
            p={1.5}
            accept='image/*'
            onChange={(event) => postDetails(event.target.files?.[0] as File)}
            borderRadius="md"
          />
        </FormControl>

        <Button
          colorScheme='blue'
          w='100%'
          mt={4}
          onClick={submitHandler}
          isLoading={loading}
          _hover={{ bg: "blue.500", transform: "scale(1.02)" }}
          boxShadow="md"
          borderRadius="md"
        >
          Sign Up
        </Button>
      </VStack>
      <Text mt={4} textAlign="center" fontSize="sm" color="gray.500">
        Already have an account? Login
      </Text>
    </Box>
  )
}

export default Signup
