export interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token?: string; 
}

export interface Chat {
  _id: string;
  isGroupChat: boolean;
  users: User[];
  chatName: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  replyTo?: Message;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isUploading?: boolean;
  createdAt?: string;
}

export const getSender = (loggedUser: User | null, users: User[]): string => {
    if (!users || users.length < 2) return "Unknown User";
    
    const otherUser = users[0]?._id === loggedUser?._id ? users[1] : users[0];
    return otherUser?.name || "Unknown User";
}

export const getSenderFull = (loggedUser: User | null, users: User[]): User | string => {
    if (!users || users.length < 2 || !loggedUser) return "Unknown User";
    
    const otherUser = users[0]?._id === loggedUser._id ? users[1] : users[0];
    return otherUser || "Unknown User";
}

export const isSameSender = (messages: Message[], m: Message, i: number, userId: string): boolean => {
    return (
        i < messages.length -1 && 
        (messages[i+1].sender._id !== m.sender._id ||
            messages[i+1].sender._id === undefined) && 
            messages[i].sender._id !== userId
        );
};

export const isLastMessage = (messages: Message[], i: number, userId: string): string | boolean => {
    return (
        i === messages.length - 1 &&
        messages[messages.length - 1].sender._id !== userId &&
        messages[messages.length-1].sender._id
    );
};

export const isSameSenderMargin = (messages: Message[], m: Message, i: number, userId: string): number | string => {
    if(
        i< messages.length - 1 &&
        messages[i+1].sender._id === m.sender._id &&
        messages[i].sender._id !== userId
    )

    return 33;
    else if(
        (i < messages.length - 1 &&
            messages[i+1].sender._id !== m.sender._id &&
            messages[i].sender._id !== userId
        )||
        (i === messages.length -1 && messages[i].sender._id !== userId)
    )

    return 0;
    else return 'auto';
}

export const isSameUser = (messages: Message[], m: Message, i: number): boolean => {
    if (!m.sender || !messages[i-1]?.sender) return false;
    return i > 0 && messages[i-1].sender._id === m.sender._id;
}
