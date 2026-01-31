import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  Icon,
  Progress,
  Image
} from '@chakra-ui/react';
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons';
import { FiImage, FiVideo, FiFile, FiSend } from 'react-icons/fi';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  isUploading,
  uploadProgress 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; 
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'application/pdf', 'application/zip', 'application/x-rar-compressed',
        'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid image, video, document, or archive file',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 10MB',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
        return;
      }

      onFileSelect(file);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FiImage;
    if (file.type.startsWith('video/')) return FiVideo;
    return FiFile;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <InputGroup>
        <Input
          ref={fileInputRef}
          type="file"
          display="none"
          onChange={handleFileChange}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
        <Input
          placeholder="Choose a file to send..."
          value={selectedFile ? selectedFile.name : ''}
          readOnly
          borderRadius="full"
          bg="gray.50"
          _focus={{ bg: "white", borderColor: "teal.400" }}
        />
        <InputRightElement width="8rem">
          <Flex gap={1}>
            {selectedFile ? (
              <Button
                size="sm"
                colorScheme="red"
                onClick={onFileRemove}
                leftIcon={<CloseIcon />}
              >
                Remove
              </Button>
            ) : (
              <Button
                size="sm"
                colorScheme="teal"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<AttachmentIcon />}
              >
                File
              </Button>
            )}
          </Flex>
        </InputRightElement>
      </InputGroup>

      {selectedFile && (
        <Box mt={2} p={3} bg="gray.50" borderRadius="md">
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={2}>
              <Icon as={getFileIcon(selectedFile)} color="teal.500" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">{selectedFile.name}</Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </Text>
              </Box>
            </Flex>
          </Flex>
          
          {selectedFile.type.startsWith('image/') && (
            <Box mt={2} maxW="200px">
              <Image 
                src={URL.createObjectURL(selectedFile)} 
                alt="Preview" 
                borderRadius="md"
                maxH="150px"
                objectFit="cover"
              />
            </Box>
          )}
          
          {isUploading && (
            <Box mt={2}>
              <Text fontSize="sm" color="teal.600">sending...</Text>
              <Progress value={uploadProgress} size="sm" colorScheme="teal" mt={1} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;