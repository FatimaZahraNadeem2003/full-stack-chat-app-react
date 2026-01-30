import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import Picker from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😊');

  const handleEmojiClick = (emojiData: any) => {
    setSelectedEmoji(emojiData.emoji);
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  const frequentlyUsedEmojis = [
    '😊', '😂', '❤️', '👍', '🔥', '🎉', '💯', '🙏',
    '😍', '😎', '🤔', '😢', '😡', '😴', '🤯', '🤩'
  ];

  return (
    <Box>
      <Popover 
        isOpen={isOpen} 
        onClose={onClose}
        placement="top-start"
        closeOnBlur={true}
      >
        <PopoverTrigger>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            fontSize="xl"
            height="auto"
            minWidth="auto"
            padding={2}
            _hover={{ bg: "gray.100" }}
            aria-label="Emoji picker"
          >
            {selectedEmoji}
          </Button>
        </PopoverTrigger>
        <PopoverContent width="350px" boxShadow="xl">
          <PopoverBody p={0}>
            <Box>
              <Box p={3} borderBottom="1px" borderColor="gray.200">
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                  Frequently Used
                </Text>
                <SimpleGrid columns={8} spacing={1}>
                  {frequentlyUsedEmojis.map((emoji, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      height="auto"
                      minWidth="auto"
                      padding={2}
                      fontSize="xl"
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        onEmojiSelect(emoji);
                        onClose();
                      }}
                      _hover={{ bg: "gray.100", transform: "scale(1.2)" }}
                      transition="all 0.2s"
                      aria-label={`Select emoji ${emoji}`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </SimpleGrid>
              </Box>
              
              <Box height="300px" overflowY="auto">
                <Picker 
                  onEmojiClick={handleEmojiClick}
                  skinTonesDisabled={false}
                  autoFocusSearch={false}
                  previewConfig={{
                    showPreview: false
                  }}
                />
              </Box>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default EmojiPicker;