import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, VStack } from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import React, { useState } from 'react'
import axios from 'axios'

interface ChangePasswordModalProps {
  user: any;
  children?: React.ReactNode;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClickOld = () => setShowOldPassword(!showOldPassword)
  const handleClickNew = () => setShowNewPassword(!showNewPassword)
  const handleClickConfirm = () => setShowConfirmPassword(!showConfirmPassword)

  const handleSubmit = async () => {
    setLoading(true)
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password must be at least 6 characters',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
      return
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.post(
        "/api/user/change-password",
        { oldPassword, newPassword },
        config
      )

      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })

      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
      
    } catch (error: any) {
      toast({
        title: 'Error occurred!',
        description: error.response?.data?.message || 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
    }
    
    setLoading(false)
  }

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <Button 
          colorScheme='teal' 
          onClick={onOpen}
          _hover={{ bg: "teal.500", transform: "scale(1.05)" }}
          borderRadius="md"
        >
          Change Password
        </Button>
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
            Change Password
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody
            display='flex'
            flexDir='column'
            alignItems='center'
            justifyContent='center'
            gap={4}
            mt={2}
          >
            <VStack spacing={4} w="100%">
              <FormControl id='old-password' isRequired>
                <FormLabel>Current Password</FormLabel>
                <InputGroup size='md'>
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder='Enter current password'
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    focusBorderColor="teal.400"
                    borderRadius="md"
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClickOld}>
                      {showOldPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl id='new-password' isRequired>
                <FormLabel>New Password</FormLabel>
                <InputGroup size='md'>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder='Enter new password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    focusBorderColor="teal.400"
                    borderRadius="md"
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClickNew}>
                      {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <InputGroup size='md'>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    focusBorderColor="teal.400"
                    borderRadius="md"
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClickConfirm}>
                      {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme='red' 
              mr={3} 
              onClick={onClose}
              _hover={{ bg: "red.500", transform: "scale(1.05)" }}
              borderRadius="md"
            >
              Cancel
            </Button>
            <Button 
              colorScheme='teal' 
              onClick={handleSubmit}
              isLoading={loading}
              _hover={{ bg: "teal.500", transform: "scale(1.05)" }}
              borderRadius="md"
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ChangePasswordModal