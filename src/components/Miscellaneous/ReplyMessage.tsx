import React from 'react';
import { Box, Text, Flex, Avatar, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

interface ReplyMessageProps {
  message: any;
  onClose: () => void;
}

const ReplyMessage: React.FC<ReplyMessageProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Box
      bg="gray.100"
      borderLeft="3px solid"
      borderColor="blue.400"
      borderRadius="md"
      p={3}
      mb={2}
      position="relative"
    >
      <Flex alignItems="flex-start" justifyContent="space-between">
        <Flex alignItems="flex-start" flex={1}>
          <Avatar 
            size="xs" 
            name={message.sender.name} 
            src={message.sender.pic} 
            mr={2}
            mt={1}
          />
          <Box flex={1}>
            <Text fontSize="xs" fontWeight="600" color="blue.600" mb={1}>
              {message.sender.name}
            </Text>
            <Text 
              fontSize="sm" 
              color="gray.800" 
              noOfLines={2}
              wordBreak="break-word"
            >
              {message.content}
            </Text>
          </Box>
        </Flex>
        
        <IconButton
          aria-label="Close reply"
          icon={<CloseIcon />}
          size="xs"
          variant="ghost"
          color="gray.500"
          onClick={onClose}
        />
      </Flex>
    </Box>
  );
};

export default ReplyMessage;