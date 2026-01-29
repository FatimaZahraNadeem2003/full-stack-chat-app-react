import React from 'react';
import { Badge, Box } from '@chakra-ui/react';

interface UnreadBadgeProps {
  count: number;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count }) => {
  if (count <= 0) return null;
  
  return (
    <Badge
      position="absolute"
      top="-5px"
      right="-5px"
      colorScheme="red"
      borderRadius="full"
      fontSize="0.6rem"
      minW="18px"
      h="18px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={2}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

export default UnreadBadge;