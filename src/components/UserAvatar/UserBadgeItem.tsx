import { Tag, TagLabel, TagCloseButton, Tooltip } from '@chakra-ui/react'
import React from 'react'

interface User {
  name: string;
  email: string;
  pic: string;
}

interface UserBadgeItemProps {
  user: User;
  handleFunction: () => void;
}

const UserBadgeItem: React.FC<UserBadgeItemProps> = ({user, handleFunction}) => {
  return (
    <Tooltip label={user.email} placement="top" hasArrow>
      <Tag
        size='md'
        borderRadius='full'
        variant='solid'
        colorScheme='purple'
        m={1}
        mb={2}
        cursor='pointer'
        onClick={handleFunction}
        boxShadow="md"
        transition="all 0.2s"
        _hover={{
          transform: "scale(1.05)",
          bgGradient: "linear(to-r, purple.400, purple.600)"
        }}
      >
        <TagLabel fontWeight="bold">{user.name}</TagLabel>
        <TagCloseButton />
      </Tag>
    </Tooltip>
  )
}

export default UserBadgeItem
