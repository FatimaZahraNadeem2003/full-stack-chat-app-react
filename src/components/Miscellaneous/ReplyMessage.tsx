import React from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { Message } from '../../Context/ChatProvider';

interface ReplyMessageProps {
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const ReplyMessage: React.FC<ReplyMessageProps> = ({ replyingTo, onCancelReply }) => {
  if (!replyingTo) return null;

  return (
    <Box 
      bg="blue.50" 
      p={3} 
      borderRadius="lg" 
      mb={2}
      borderLeft="3px solid" 
      borderLeftColor="blue.400"
      position="relative"
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" flex={1}>
          <Avatar size="xs" src={replyingTo.sender.pic} name={replyingTo.sender.name} mr={2} />
          <Box flex={1} overflow="hidden">
            <Text fontSize="xs" fontWeight="bold" color="blue.600" noOfLines={1}>
              {replyingTo.sender.name}
            </Text>
            <Text fontSize="sm" color="gray.700" noOfLines={1}>
              {replyingTo.content}
            </Text>
          </Box>
        </Flex>
        <IconButton
          aria-label="Cancel reply"
          icon={<SmallCloseIcon />}
          size="sm"
          variant="ghost"
          color="blue.500"
          onClick={onCancelReply}
        />
      </Flex>
    </Box>
  );
};

export default ReplyMessage;