import React from 'react';
import { ChatState } from '../../Context/ChatProvider';
import {
  Box,
  Text,
  Avatar,
  Flex,
  Image,
  Link,
  Icon,
  Button
} from '@chakra-ui/react';
import { FiDownload, FiImage, FiVideo, FiFile } from 'react-icons/fi';
import './styles.css';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    pic: string;
  };
  content: string;
  chat: any; 
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

interface ScrollableChatProps {
  messages: Message[];
}

const ScrollableChat: React.FC<ScrollableChatProps> = ({ messages }) => {
  const { user } = ChatState();

  const isSameSender = (messages: Message[], m: Message, i: number, userId: string) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages: Message[], i: number, userId: string) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  const isSameUser = (messages: Message[], m: Message, i: number) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FiImage;
    if (fileType.startsWith('video/')) return FiVideo;
    return FiFile;
  };

  const formatFileSize = (fileUrl: string) => {
    return 'File';
  };

  return (
    <Box className="scrollable-chat">
      {messages &&
        messages.map((m, i) => (
          <Box
            key={m._id}
            display="flex"
            alignItems="center"
            justifyContent={m.sender._id === user?._id ? 'flex-end' : 'flex-start'}
            mb={isSameUser(messages, m, i) ? 1 : 3}
          >
            {(isSameSender(messages, m, i, user?._id as string) ||
              isLastMessage(messages, i, user?._id as string)) && (
              <Avatar
                mt="7px"
                mr={1}
                size="sm"
                cursor="pointer"
                name={m.sender.name}
                src={m.sender.pic}
              />
            )}
            <Box
              bg={m.sender._id === user?._id ? '#BEE3F8' : '#FFF'}
              ml={isSameUser(messages, m, i) ? '40px' : '0'}
              px={3}
              py={2}
              borderRadius={m.sender._id === user?._id ? '20px 20px 5px 20px' : '20px 20px 20px 5px'}
              maxW="70%"
              boxShadow="sm"
            >
              {m.fileUrl && (
                <Box mb={m.content ? 2 : 0}>
                  {m.fileType.startsWith('image/') ? (
                    <Box>
                      <Image 
                        src={m.fileUrl} 
                        alt="Shared image" 
                        borderRadius="md"
                        maxH="300px"
                        objectFit="cover"
                        mb={2}
                      />
                      <Link 
                        href={m.fileUrl} 
                        isExternal 
                        color="teal.600" 
                        fontSize="sm"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiDownload} />
                          Download Image
                        </Flex>
                      </Link>
                    </Box>
                  ) : m.fileType.startsWith('video/') ? (
                    <Box>
                      <video 
                        src={m.fileUrl} 
                        controls 
                        style={{ 
                          maxWidth: '100%', 
                          borderRadius: '8px',
                          marginBottom: '8px'
                        }}
                      />
                      <Link 
                        href={m.fileUrl} 
                        isExternal 
                        color="teal.600" 
                        fontSize="sm"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiDownload} />
                          Download Video
                        </Flex>
                      </Link>
                    </Box>
                  ) : (
                    <Box 
                      bg="gray.100" 
                      p={3} 
                      borderRadius="md" 
                      border="1px solid" 
                      borderColor="gray.200"
                    >
                      <Flex align="center" gap={2}>
                        <Icon as={getFileIcon(m.fileType)} color="teal.500" />
                        <Box flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {m.fileUrl.split('/').pop()}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatFileSize(m.fileUrl)}
                          </Text>
                        </Box>
                        <Link href={m.fileUrl} isExternal>
                          <Button size="sm" colorScheme="teal" leftIcon={<FiDownload />}>
                            Download
                          </Button>
                        </Link>
                      </Flex>
                    </Box>
                  )}
                </Box>
              )}
              
              {m.content && (
                <Text fontSize="sm">{m.content}</Text>
              )}
              
              <Text 
                fontSize="xs" 
                color={m.sender._id === user?._id ? "blue.800" : "gray.500"} 
                textAlign="right"
                mt={1}
              >
                {formatDate(m.createdAt)}
              </Text>
            </Box>
          </Box>
        ))}
    </Box>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For older messages, show date and time
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ScrollableChat;