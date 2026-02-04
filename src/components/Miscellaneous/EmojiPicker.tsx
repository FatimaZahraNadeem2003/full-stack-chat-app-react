import React, { useState } from 'react';
import Picker from 'emoji-picker-react';
import { IconButton, Box } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiObject: any) => {
    onEmojiSelect(emojiObject.emoji);
    setIsOpen(false);
  };

  return (
    <Box position="relative" display="inline-block">
      <IconButton
        aria-label="Add Emoji"
        icon={<AddIcon />}
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        color={isOpen ? "teal.500" : "gray.500"}
      />
      
      {isOpen && (
        <Box
          position="absolute"
          bottom="40px"
          left="0"
          zIndex={9999}
          boxShadow="xl"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          p={2}
        >
          <Picker 
            onEmojiClick={handleEmojiClick}
            preload={true}
            skinTonesDisabled={false}
            height={300}
            width={300}
          />
        </Box>
      )}
    </Box>
  );
};

export default EmojiPicker;