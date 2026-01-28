import React from 'react'
import { Avatar, Box, Text } from '@chakra-ui/react';

interface User {
  name: string;
  email: string;
  pic: string;
}

interface UserListItemProps {
  user: User;
  handleFunction: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({user, handleFunction}) => {
  return (
    <Box 
      onClick={handleFunction}
      cursor='pointer'
      bg="rgba(255, 255, 255, 0.15)"
      backdropFilter="blur(8px)"
      w='100%'
      display='flex'
      alignItems='center'
      color='black'
      px={3}
      py={3}
      mb={2}
      borderRadius='xl'
      boxShadow="sm"
      transition="all 0.2s ease"
      _hover={{
        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
        color: 'white',
        transform: "scale(1.03)",
        boxShadow: "md"
      }}
    >
      <Avatar
        mr={3}
        size='md'
        cursor='pointer'
        name={user.name}
        src={user.pic}
        borderWidth="2px"
        borderColor="purple.500"
      />
      <Box>
        <Text fontWeight="bold" fontSize="md">{user.name}</Text>
        <Text fontSize='xs' opacity={0.8}><b>Email:</b> {user.email}</Text>
      </Box>
    </Box>
  )
}

export default UserListItem
