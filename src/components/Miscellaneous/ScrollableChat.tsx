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
  Button,
  IconButton
} from '@chakra-ui/react';
import { FiDownload, FiImage, FiVideo, FiFile } from 'react-icons/fi';
import { FaReply } from 'react-icons/fa';
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
  fileName: string;
  fileType: string;
  createdAt: string;
  replyTo?: Message;
}

interface ScrollableChatProps {
  messages: Message[];
  onReply: (message: Message) => void; 
}

const ScrollableChat: React.FC<ScrollableChatProps> = ({ messages, onReply }) => {
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

  return (
    <Box className="scrollable-chat" p={3}>
      {messages &&
        messages.map((m, i) => (
          <Box
            key={m._id}
            display="flex"
            alignItems="center"
            justifyContent={m.sender._id === user?._id ? 'flex-end' : 'flex-start'}
            mb={isSameUser(messages, m, i) ? 1 : 3}
            onDoubleClick={() => onReply(m)} 
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
              maxW="75%"
              boxShadow="sm"
              position="relative"
            >
              {m.replyTo && (
                <Box
                  bg="rgba(0,0,0,0.06)"
                  p={2}
                  mb={2}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="teal.500"
                  fontSize="xs"
                >
                  <Text fontWeight="bold" color="teal.700" noOfLines={1}>
                    {m.replyTo.sender.name}
                  </Text>
                  <Text noOfLines={1} color="gray.600">
                    {m.replyTo.content || (m.replyTo.fileUrl ? "Attachment" : "")}
                  </Text>
                </Box>
              )}

              {m.fileUrl && (
                <Box mb={m.content ? 2 : 0}>
                  {m.fileType.startsWith('image/') ? (
                    <Box>
                      <Image src={m.fileUrl} borderRadius="md" maxH="300px" objectFit="cover" mb={1}/>
                      <Link href={m.fileUrl} isExternal color="teal.600" fontSize="xs">Download Image</Link>
                    </Box>
                  ) : m.fileType.startsWith('video/') ? (
                    <Box>
                      <video src={m.fileUrl} controls style={{ maxWidth: '100%', borderRadius: '8px' }}/>
                    </Box>
                  ) : (
                    <Box bg="gray.50" p={2} borderRadius="md" border="1px solid #eee">
                       <Flex align="center" gap={2}>
                          <Icon as={getFileIcon(m.fileType)} />
                          <Text fontSize="xs" noOfLines={1}>{m.fileName}</Text>
                       </Flex>
                    </Box>
                  )}
                </Box>
              )}
              
              {m.content && <Text fontSize="sm">{m.content}</Text>}
              
              <Text fontSize="9px" color="gray.500" textAlign="right" mt={1}>
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
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ScrollableChat;