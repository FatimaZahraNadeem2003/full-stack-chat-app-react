import React, { useState } from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { isSameUser, Message } from '../config/ChatLogics'
import { ChatState } from './../Context/ChatProvider';
import { 
  Avatar, 
  Tooltip, 
  Box, 
  Text, 
  Flex, 
  VStack, 
  IconButton, 
  Icon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Spinner
} from '@chakra-ui/react';
import { DownloadIcon, CloseIcon } from '@chakra-ui/icons';
import { FiDownload, FiX } from 'react-icons/fi';
import MessageContextMenu from './Miscellaneous/MessageContextMenu';
import ReplyMessage from './Miscellaneous/ReplyMessage';

interface ScrollableChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ScrollableChat: React.FC<ScrollableChatProps> = ({ messages, setMessages }) => {
  const { user } = ChatState();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMedia, setSelectedMedia] = useState<{url: string, type: string} | null>(null);

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

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const clearReply = () => {
    setReplyingTo(null);
  };

  return (
    <Box 
      position="relative" 
      w="100%" 
      h="100%" 
      overflowX="hidden" 
    >
      {replyingTo && (
        <ReplyMessage message={replyingTo} onClose={clearReply} />
      )}
      
      <ScrollableFeed>
        {messages && messages.map((m, i) => {
          if (!m.sender) return null;
          
          const isMe = m.sender._id === user?._id;
          const isFirstInGroup = i === 0 || !messages[i - 1]?.sender || messages[i - 1].sender._id !== m.sender._id;

          return (
            <Box
              key={m._id}
              w="100%" 
              display="flex"
              justifyContent={isMe ? 'flex-end' : 'flex-start'}
              px={{ base: 2, md: 4 }} 
              mb={isSameUser(messages, m, i) ? 1 : 3}
              position="relative"
              className="message-container"
            >
              {!isMe && (
                <Box w="32px" mr={2} flexShrink={0}> 
                  {isFirstInGroup ? (
                    <Tooltip label={m.sender.name} placement='bottom-start' hasArrow>
                      <Avatar
                        size='xs'
                        cursor='pointer'
                        name={m.sender.name}
                        src={m.sender.pic}
                      />
                    </Tooltip>
                  ) : null}
                </Box>
              )}

              <VStack align={isMe ? 'flex-end' : 'flex-start'} spacing={0} maxW="80%">
                {!isMe && isFirstInGroup && (
                  <Text 
                    fontSize='xs' 
                    fontWeight='bold' 
                    color='teal.600' 
                    ml={1} 
                    mb={1}
                  >
                    {m.sender.name}
                  </Text>
                )}

                <Box
                  bg={isMe ? '#dcf8c6' : 'white'} 
                  color='gray.800'
                  borderRadius={isMe 
                      ? '10px 0px 10px 10px' 
                      : '0px 10px 10px 10px' 
                  }
                  p='6px 12px'
                  boxShadow='sm'
                  wordBreak='break-word' 
                  position="relative"
                  w="fit-content" 
                  border={m.replyTo ? "1px solid" : "none"}
                  borderColor={m.replyTo ? "blue.100" : "transparent"}
                >
                  <Flex alignItems="flex-start" gap={2}>
                    <VStack align="stretch" spacing={1} flex={1}>
                      {m.replyTo && (
                        <Text fontSize="10px" color="blue.500" fontWeight="500" mb={1}>
                          ↳ This is a reply
                        </Text>
                      )}
                      {m.replyTo && m.replyTo.sender && (
                        <Box
                          bg="blue.50" 
                          borderLeft="4px solid"
                          borderColor="blue.500"
                          borderRadius="md"
                          p={2}
                          mb={2}
                          maxW="100%"
                          boxShadow="sm"
                        >
                          <Flex alignItems="center" mb={1}>
                            <Text fontSize="10px" fontWeight="700" color="blue.700" mr={2}>
                              ↳ Replying to {m.replyTo.sender.name}:
                            </Text>
                          </Flex>
                          <Text fontSize="xs" color="gray.700" noOfLines={2} fontStyle="italic">
                            "{m.replyTo.content}"
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
                      ) : m.fileUrl ? (
                        <Box>
                          {m.fileType?.startsWith('image/') ? (
                            <Box 
                              position="relative" 
                              borderRadius="lg" 
                              overflow="hidden"
                              cursor="pointer"
                              onClick={() => openMediaModal(m.fileUrl!, 'image')}
                              _hover={{ opacity: 0.9 }}
                              transition="opacity 0.2s"
                              mb={2}
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
                                    downloadMedia(m.fileUrl!, m.fileName || 'image.jpg');
                                  }}
                                />
                              </Flex>
                            </Box>
                          ) : m.fileType?.startsWith('video/') ? (
                            <Box 
                              position="relative" 
                              borderRadius="lg" 
                              overflow="hidden"
                              bg="black"
                              mb={2}
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
                                    downloadMedia(m.fileUrl!, m.fileName || 'video.mp4');
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
                              onClick={() => downloadMedia(m.fileUrl!, m.fileName || 'file')}
                              mb={2}
                            >
                              <Flex align="center" gap={3}>
                                <Box 
                                  bg="blue.100" 
                                  p={2} 
                                  borderRadius="full"
                                >
                                  <Icon as={FiDownload} color="blue.600" />
                                </Box>
                                <Box flex={1}>
                                  <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                                    {m.fileName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {m.fileType?.split('/')[1] || 'File'}
                                  </Text>
                                </Box>
                                <Icon as={FiDownload} color="gray.500" />
                              </Flex>
                            </Box>
                          )}
                          {m.content && (
                            <Text fontSize="14px" color="gray.700">
                              {m.content}
                            </Text>
                          )}
                        </Box>
                      ) : (
                        <>
                          <Text fontSize="14px" lineHeight="short">
                            {m.content}
                          </Text>
                        </>
                      )}
                      
                      <Text 
                        fontSize="9px" 
                        textAlign="right" 
                        color="gray.500" 
                        mt={1}
                        userSelect="none"
                      >
                        {m.createdAt ? formatDate(m.createdAt) : 'Just now'}
                      </Text>
                    </VStack>
                    
                    <Box ml={1}>
                        <MessageContextMenu 
                          message={m} 
                          messages={messages} 
                          setMessages={setMessages}
                          onReply={handleReply}
                        />
                    </Box>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          );
        }).filter(Boolean)} 
      </ScrollableFeed>
      
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
  )
}

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