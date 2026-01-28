import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast, Flex } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from './../config/ChatLogics';
import ProfileModal from './Miscellaneous/ProfileModal';
import UpdateGroupChatModal from './Miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../animations/typing.json'

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

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
}

interface SingleChatProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ENDPOINT = 'http://localhost:5000';
var socket: any, selectedChatCompare: any;

const SingleChat: React.FC<SingleChatProps> = ({ fetchAgain, setFetchAgain }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
  }

  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${(user as User).token}` } };
      const { data } = await axios.get<Message[]>(`/api/message/${(selectedChat as Chat)._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit('join chat', (selectedChat as Chat)._id);
    } catch (error: any) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to load messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      });
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, [])

  const sendMessage = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', (selectedChat as Chat)._id)
      try {
        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${(user as User).token}` } };
        const messageContent = newMessage;
        setNewMessage('');
        const { data } = await axios.post<Message>('/api/message', {
          content: messageContent,
          chatId: selectedChat
        }, config);

        socket.emit('new message', data)
        setMessages([...messages, data])
      } catch (error: any) {
        toast({
          title: 'Error Occured!',
          description: 'Failed to send the message',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
      }
    }
  }

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on('message recieved', (newMessageRecieved: Message) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved])
      }
    });
  })

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', (selectedChat as Chat)._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', (selectedChat as Chat)._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Flex
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w='100%'
            fontFamily='Work sans'
            alignItems='center'
            justifyContent='space-between'
            zIndex={0} 
            position="relative"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
              aria-label="Back"
              variant='ghost'
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users) as User} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Flex>

          <Box
            display='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='gray.50'
            w='100%'
            h='100%'
            borderRadius='lg'
            overflowY='hidden'
            boxShadow='inner'
            zIndex={0} 
            position="relative"
          >
            {loading ? (
              <Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto' />
            ) : (
              <ScrollableChat messages={messages} />
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3} display='flex' alignItems='center'>
              {isTyping && (
                <Box mr={2}>
                  <Lottie options={defaultOptions} width={50} style={{ marginBottom: 10 }} />
                </Box>
              )}
              <Input
                variant='filled'
                bg='white'
                placeholder='Enter a message...'
                onChange={typingHandler}
                value={newMessage}
                borderRadius='full'
                boxShadow='sm'
                _focus={{ borderColor: 'teal.400' }}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display='flex' alignItems='center' justifyContent='center' h='100%'>
          <Text fontSize='3xl' pb={3} fontFamily='Work sans' color='gray.500'>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  )
}

export default SingleChat;
