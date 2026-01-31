import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  Skeleton,
  VStack,
  HStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";


interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  groupAdmin?: User;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isUploading?: boolean;
}

interface MonitorChatProps {
  selectedChat: Chat | null;
  onClose: () => void;
}


const MonitorChat: React.FC<MonitorChatProps> = ({
  selectedChat,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const adminInfo = JSON.parse(
        localStorage.getItem("adminInfo") || "{}"
      );

      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };

      const { data } = await axios.get<Message[]>(
        `/api/admin/chat/${selectedChat._id}/messages`,
        config
      );

      setMessages(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Failed to load messages",
        status: "error",
        duration: 4000,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!selectedChat) return null;


  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Flex
        bg="white"
        p={3}
        borderRadius="lg"
        shadow="sm"
        align="center"
        justify="space-between"
        mb={3}
      >
        <HStack spacing={3}>
          <Avatar
            size="sm"
            name={
              selectedChat.isGroupChat
                ? selectedChat.chatName
                : selectedChat.users.map((u) => u.name).join(" & ")
            }
          />
          <Box>
            <Heading size="sm">
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : selectedChat.users.map((u) => u.name).join(" & ")}
            </Heading>
            <Text fontSize="xs" color="gray.500">
              {selectedChat.isGroupChat ? (
                <>
                  Group • {selectedChat.users.length} members
                  {selectedChat.groupAdmin && (
                    <Badge ml={2} colorScheme="purple">
                      Admin: {selectedChat.groupAdmin.name}
                    </Badge>
                  )}
                </>
              ) : (
                "Private Chat"
              )}
            </Text>
          </Box>
        </HStack>

        <Button size="xs" colorScheme="red" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </Flex>

      <Box
        flex={1}
        overflowY="auto"
        p={4}
        borderRadius="lg"
        bgImage="url('/chat-bg.avif')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        {loading ? (
          <VStack spacing={4}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="60px" borderRadius="lg" />
            ))}
          </VStack>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <Flex key={msg._id} mb={3} align="flex-start">
              <Avatar
                size="xs"
                src={msg.sender?.pic}
                name={msg.sender?.name}
                mr={2}
              />

              <Box
                maxW="75%"
                bg="white"
                p={2}
                px={3}
                borderRadius="lg"
                boxShadow="sm"
              >
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="teal.600"
                  mb={1}
                >
                  {msg.sender?.name || "Unknown User"}
                </Text>

                {msg.isUploading ? (
                  <Text fontSize="sm" color="gray.500">
                    Uploading...
                  </Text>
                ) : msg.fileUrl ? (
                  <>
                    {msg.fileType?.startsWith("image/") && (
                      <img
                        src={msg.fileUrl}
                        alt={msg.fileName}
                        style={{
                          maxWidth: "220px",
                          borderRadius: "8px",
                          marginBottom: "6px",
                        }}
                      />
                    )}

                    {msg.fileType?.startsWith("video/") && (
                      <video
                        src={msg.fileUrl}
                        controls
                        style={{
                          maxWidth: "220px",
                          borderRadius: "8px",
                          marginBottom: "6px",
                        }}
                      />
                    )}

                    {!msg.fileType?.startsWith("image/") &&
                      !msg.fileType?.startsWith("video/") && (
                        <Text fontSize="sm">📎 {msg.fileName}</Text>
                      )}

                    {msg.content && (
                      <Text fontSize="sm">{msg.content}</Text>
                    )}
                  </>
                ) : (
                  <Text fontSize="sm">{msg.content}</Text>
                )}

                <Text
                  fontSize="9px"
                  color="gray.500"
                  textAlign="right"
                  mt={1}
                >
                  {formatTime(msg.createdAt)}
                </Text>
              </Box>
            </Flex>
          ))
        ) : (
          <Flex justify="center" align="center" h="100%">
            <Text color="gray.400">No messages in this chat</Text>
          </Flex>
        )}
      </Box>

      <Box
        mt={2}
        p={3}
        bg="white"
        borderRadius="lg"
        textAlign="center"
      >
        <Text fontSize="xs" fontWeight="bold" color="orange.500">
          MONITORING MODE
        </Text>
        <Text fontSize="xs" color="gray.500">
          Admin can only see the messages but cannot chat!
        </Text>
      </Box>
    </Box>
  );
};

export default MonitorChat;
