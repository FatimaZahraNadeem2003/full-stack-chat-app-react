import React from 'react';
import Picker from 'emoji-picker-react';
import { Popover, PopoverTrigger, PopoverContent, IconButton, Box, Portal } from '@chakra-ui/react';
import { BsEmojiSmile } from 'react-icons/bs';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  return (
    <Popover placement="top-start" isLazy>
      <PopoverTrigger>
        <IconButton
          aria-label="Add Emoji"
          icon={<BsEmojiSmile size="22px" color="#54656f" />}
          variant="ghost"
          borderRadius="full"
          _hover={{ bg: "gray.100" }}
        />
      </PopoverTrigger>
      <Portal>
        <Box zIndex={10000}>
          <PopoverContent border="none" boxShadow="2xl" borderRadius="15px" width="auto">
            <Picker 
              onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
              height={400}
              width={320}
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Box>
      </Portal>
    </Popover>
  );
};

export default EmojiPicker;