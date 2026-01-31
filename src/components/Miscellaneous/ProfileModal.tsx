import { ViewIcon } from '@chakra-ui/icons'
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, Box, VStack } from '@chakra-ui/react'
import React from 'react'
import ChangePasswordModal from './ChangePasswordModal'

interface User {
  name: string;
  email: string;
  pic: string;
}

interface ProfileModalProps {
  user: User;
  children?: React.ReactNode;
}

const ProfileModal: React.FC<ProfileModalProps> = ({user, children}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton 
          display={{ base: "flex" }} 
          icon={<ViewIcon />} 
          onClick={onOpen} 
          aria-label="View Profile" 
          colorScheme="blue"
          _hover={{ bg: "blue.500", transform: "scale(1.05)" }}
        />
      )}

      <Modal size='md' isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" bg="gray.50" boxShadow="2xl" p={4}>
          <ModalHeader
            fontSize={{ base: "2xl", md: "3xl" }}
            fontFamily="Work sans"
            display='flex'
            justifyContent='center'
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody
            display='flex'
            flexDir='column'
            alignItems='center'
            justifyContent='center'
            gap={5}
            mt={2}
          >
            <Box 
              borderRadius="full" 
              overflow="hidden" 
              boxSize="160px" 
              boxShadow="lg"
            >
              <Image
                src={user.pic}
                alt={user.name}
                objectFit="cover"
                boxSize="100%"
              />
            </Box>

            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              fontFamily="Work sans"
              color="gray.700"
              textAlign="center"
            >
              Email: {user.email}
            </Text>
          </ModalBody>

          <ModalFooter>
            <VStack spacing={3} w="100%">
              <ChangePasswordModal user={user} />
              <Button 
                colorScheme='blue' 
                onClick={onClose}
                _hover={{ bg: "blue.500", transform: "scale(1.05)" }}
                borderRadius="md"
                w="100%"
              >
                Close
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProfileModal