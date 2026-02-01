import React, { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import {
  Box,
  Text,
  Avatar,
  Flex,
  Image,
  Icon,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Spinner
} from '@chakra-ui/react';
import { FiDownload, FiImage, FiVideo, FiFile, FiX } from 'react-icons/fi';
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
  isUploading?: boolean;
}

interface ScrollableChatProps {
  messages: Message[];
  onReply: (message: Message) => void; 
}

const ScrollableChat: React.FC<ScrollableChatProps> = ({ messages, onReply }) => {
  const { user } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMedia, setSelectedMedia] = useState<{url: string, type: string} | null>(null);

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

  const openMediaModal = (url: string, type: string) => {
    setSelectedMedia({ url, type });
    onOpen();
  };

  const downloadMedia = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box 
      className="scrollable-chat" 
      p={3}
      bgImage="url('/chat-bg.avif')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      minH="100%"
    >
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

              {m.isUploading ? (
                <Box bg="gray.100" p={3} borderRadius="lg" mb={2}>
                  <Flex align="center" gap={3}>
                    <Spinner size="sm" />
                    <Box>
                      <Text fontSize="sm" fontWeight="500">Uploading {m.fileName || 'file'}...</Text>
                      <Text fontSize="xs" color="gray.500">Please wait</Text>
                    </Box>
                  </Flex>
                </Box>
              ) : m.fileUrl && (
                <Box mb={m.content ? 2 : 0}>
                  {m.fileType.startsWith('image/') ? (
                    <Box 
                      position="relative" 
                      borderRadius="lg" 
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => openMediaModal(m.fileUrl, 'image')}
                      _hover={{ opacity: 0.9 }}
                      transition="opacity 0.2s"
                    >
                      <Image 
                        src={m.fileUrl} 
                        borderRadius="lg" 
                        maxH="300px" 
                        objectFit="cover" 
                        w="100%"
                        fallbackSrc="https://via.placeholder.com/300x200?text=Loading+Image..."
                      />
                      <Flex 
                        position="absolute" 
                        top={2} 
                        right={2} 
                        bg="blackAlpha.600" 
                        borderRadius="full" 
                        p={1}
                      >
                        <IconButton
                          aria-label="Download image"
                          icon={<FiDownload size={16} />}
                          size="xs"
                          color="white"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadMedia(m.fileUrl, m.fileName || 'image.jpg');
                          }}
                        />
                      </Flex>
                    </Box>
                  ) : m.fileType.startsWith('video/') ? (
                    <Box 
                      position="relative" 
                      borderRadius="lg" 
                      overflow="hidden"
                      bg="black"
                    >
                      <video 
                        src={m.fileUrl} 
                        controls 
                        style={{ 
                          width: '100%', 
                          maxHeight: '300px',
                          borderRadius: '8px'
                        }}
                      />
                      <Flex 
                        position="absolute" 
                        top={2} 
                        right={2} 
                        bg="blackAlpha.600" 
                        borderRadius="full" 
                        p={1}
                      >
                        <IconButton
                          aria-label="Download video"
                          icon={<FiDownload size={16} />}
                          size="xs"
                          color="white"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadMedia(m.fileUrl, m.fileName || 'video.mp4');
                          }}
                        />
                      </Flex>
                    </Box>
                  ) : (
                    <Box 
                      bg="gray.50" 
                      p={3} 
                      borderRadius="lg" 
                      border="1px solid" 
                      borderColor="gray.200"
                      _hover={{ bg: 'gray.100' }}
                      cursor="pointer"
                      onClick={() => downloadMedia(m.fileUrl, m.fileName || 'file')}
                    >
                      <Flex align="center" gap={3}>
                        <Box 
                          bg="blue.100" 
                          p={2} 
                          borderRadius="full"
                        >
                          <Icon as={getFileIcon(m.fileType)} color="blue.600" />
                        </Box>
                        <Box flex={1}>
                          <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                            {m.fileName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {m.fileType.split('/')[1] || 'File'}
                          </Text>
                        </Box>
                        <Icon as={FiDownload} color="gray.500" />
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
      
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent 
          bg="transparent" 
          boxShadow="none" 
          maxW="90vw" 
          maxH="90vh"
          position="relative"
        >
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center">
            {selectedMedia?.type === 'image' && (
              <Box position="relative" maxW="100%" maxH="100%">
                <Image 
                  src={selectedMedia.url} 
                  maxW="100%" 
                  maxH="80vh" 
                  objectFit="contain"
                  borderRadius="lg"
                />
                <IconButton
                  position="absolute"
                  top={4}
                  right={4}
                  aria-label="Close"
                  icon={<FiX size={24} />}
                  size="lg"
                  color="white"
                  bg="blackAlpha.600"
                  _hover={{ bg: 'blackAlpha.800' }}
                  onClick={onClose}
                />
                <IconButton
                  position="absolute"
                  bottom={4}
                  right={4}
                  aria-label="Download"
                  icon={<FiDownload size={20} />}
                  size="md"
                  color="white"
                  bg="blackAlpha.600"
                  _hover={{ bg: 'blackAlpha.800' }}
                  onClick={() => downloadMedia(selectedMedia.url, 'media.jpg')}
                />
              </Box>
            )}
            
            {selectedMedia?.type === 'video' && (
              <Box position="relative" maxW="100%" maxH="100%">
                <video 
                  src={selectedMedia.url} 
                  controls 
                  autoPlay
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '80vh',
                    borderRadius: '12px'
                  }}
                />
                <IconButton
                  position="absolute"
                  top={4}
                  right={4}
                  aria-label="Close"
                  icon={<FiX size={24} />}
                  size="lg"
                  color="white"
                  bg="blackAlpha.600"
                  _hover={{ bg: 'blackAlpha.800' }}
                  onClick={onClose}
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  
  if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  
  if (diffInDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }) + ' at ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default ScrollableChat;