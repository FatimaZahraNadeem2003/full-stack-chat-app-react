import React, { useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { ChatState, Message } from "../Context/ChatProvider";
import { Box, Text, Flex, Avatar, Tooltip, Image, Icon, IconButton } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import MessageContextMenu from './Miscellaneous/MessageContextMenu';

// Separate component for individual message to handle hover state
const MessageItem = ({ m, user, messages, setMessages, onReply }: { 
  m: Message; 
  user: any; 
  messages: Message[]; 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; 
  onReply: (message: Message) => void; 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Flex 
      w="100%" 
      mt={2} 
      justify={m.sender._id === user?._id ? "flex-end" : "flex-start"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {m.sender._id !== user?._id && (
        <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
          <Avatar size="xs" name={m.sender.name} src={m.sender.pic} mr={1} mt="10px" />
        </Tooltip>
      )}
      <Box
        maxW="75%"
        bg={m.sender._id === user?._id ? "#DCF8C6" : "#FFFFFF"}
        borderRadius={m.sender._id === user?._id ? "15px 15px 0 15px" : "15px 15px 15px 0"}
        p="8px 12px"
        boxShadow="sm"
        position="relative"
        borderWidth="1px"
        borderColor={m.sender._id === user?._id ? "#C7EBB3" : "#E2E2E2"}
        _hover={{ bg: m.sender._id === user?._id ? "#C7EBB3" : "#F0F0F0" }}
        transition="background-color 0.2s"
      >
        <Box
          position="absolute"
          top={1}
          right={m.sender._id === user?._id ? 1 : "auto"}
          left={m.sender._id !== user?._id ? 1 : "auto"}
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.2s"
          zIndex={10}
        >
          <MessageContextMenu 
            message={m} 
            onReply={onReply}
            messages={messages}
            setMessages={setMessages}
          />
        </Box>

        {m.replyTo && (
          <Box 
            bg="blue.50" 
            p={2} 
            borderRadius="md" 
            mb={2}
            borderLeft="2px solid" 
            borderLeftColor="blue.400"
          >
            <Text fontSize="xs" fontWeight="bold" color="blue.600">
              {m.replyTo.sender?.name || "Someone"}
            </Text>
            <Text fontSize="sm" color="gray.700" noOfLines={1}>
              {m.replyTo.content}
            </Text>
          </Box>
        )}

        {m.fileUrl ? (
          <Box mb={2} position="relative">
            {m.fileType?.startsWith("image/") ? (
              <Box position="relative" display="inline-block">
                <Image
                  src={m.fileUrl}
                  alt="shared-img"
                  borderRadius="lg"
                  maxH="300px"
                  objectFit="contain"
                  cursor="pointer"
                  onClick={() => window.open(m.fileUrl!, "_blank")}
                  transition="transform 0.2s"
                  _hover={{ transform: "scale(1.02)" }}
                />
                <IconButton
                  aria-label="Download Image"
                  icon={<DownloadIcon />}
                  size="sm"
                  colorScheme="whiteAlpha"
                  bg="blackAlpha.600"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (m.fileUrl) downloadFile(m.fileUrl, m.fileName || "image.jpg");
                  }}
                  _hover={{ bg: "blackAlpha.700" }}
                />
              </Box>
            ) : m.fileType?.startsWith("video/") ? (
              <Box position="relative" display="inline-block">
                <video 
                  controls 
                  style={{ borderRadius: '8px', maxHeight: '300px', width: '100%', maxWidth: '400px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <source src={m.fileUrl} type={m.fileType} />
                  Your browser does not support the video tag.
                </video>
                <IconButton
                  aria-label="Download Video"
                  icon={<DownloadIcon />}
                  size="sm"
                  colorScheme="whiteAlpha"
                  bg="blackAlpha.600"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (m.fileUrl) downloadFile(m.fileUrl, m.fileName || "video.mp4");
                  }}
                  _hover={{ bg: "blackAlpha.700" }}
                />
              </Box>
            ) : (
              <Flex align="center" bg="gray.100" p={3} borderRadius="md" maxW="300px">
                <Icon as={DownloadIcon} mr={2} color="blue.500" />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">{m.fileName || "File"}</Text>
                  <Text fontSize="xs" color="gray.500">{m.fileType || "File"}</Text>
                </Box>
                <IconButton
                  aria-label="Download File"
                  icon={<DownloadIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  ml={2}
                  onClick={() => {
                    if (m.fileUrl) downloadFile(m.fileUrl, m.fileName || "file");
                  }}
                />
              </Flex>
            )}
          </Box>
        ) : null}

        <Text fontSize="15px">{m.content}</Text>
        <Text fontSize="9px" textAlign="right" color="gray.500" mt={1}>
          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </Text>
      </Box>
    </Flex>
  );
};

const ScrollableChat = ({ messages, setMessages, onReply }: { messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>; onReply: (message: Message) => void; }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages && messages.map((m: Message, i: number) => (
        <MessageItem 
          key={m._id} 
          m={m} 
          user={user} 
          messages={messages} 
          setMessages={setMessages} 
          onReply={onReply} 
        />
      ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;