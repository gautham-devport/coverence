import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import PlusIcon from "../../assets/Icons/plus.png";
import Mic from "../../assets/Icons/mic.png";
import SendIcon from "../../assets/Icons/paper-plane.png";
import { WebSocketContext } from "../context/WebSocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import MediaPopUp from "./MediaPopUp";

const Chat = () => {
    const navigate = useNavigate();
    const { receiverId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [ws, setWs] = useState(null);
    const [receiverStatus, setReceiverStatus] = useState({
        online: false,
        lastSeen: null,
    });
    const [receiverInfo, setReceiverInfo] = useState(null);
    const [typingStatus, setTypingStatus] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const bottomRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const seenTimeoutRef = useRef(null);
    const globalSocket = useContext(WebSocketContext);

    const token = localStorage.getItem("token");
    const userId = String(localStorage.getItem("userId"));
    const isFirstLoad = useRef(true);

    const formatDateHeading = (dateString) => {
        const msgDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (msgDate.toDateString() === today.toDateString()) return "Today";
        if (msgDate.toDateString() === yesterday.toDateString())
            return "Yesterday";

        return msgDate.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatLastSeen = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / 1000;

        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (diff < 60) return "few seconds ago";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (isToday) {
            return `today ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}`;
        }
        if (isYesterday) {
            return `yesterday at ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}`;
        }

        return `on ${date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        })} at ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    };

    const groupMessagesByDate = (messages) => {
        const grouped = {};
        messages.forEach((msg) => {
            const dateKey = new Date(msg.timestamp).toDateString();
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(msg);
        });
        return grouped;
    };

    const markMessagesAsSeen = useCallback(async () => {
        try {
            await axios.post(
                `https://coverence-backend.onrender.com/api/chat/${receiverId}/mark-seen/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.setItem("seenForUser", receiverId);
            window.dispatchEvent(new Event("forceSeenNow"));
            localStorage.setItem("refreshSidebarMessages", "true");
            window.dispatchEvent(new Event("refreshSidebarNow"));
        } catch (err) {
            console.error("Failed to mark messages as seen", err);
        }
    }, [receiverId, token]);

    const handleIncomingMessage = useCallback(
        (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    sender_id: data.sender_id,
                    sender_name: data.sender,
                    content: data.message,
                    timestamp: new Date().toISOString(),
                },
            ]);

            if (String(data.sender_id) !== userId) {
                if (seenTimeoutRef.current)
                    clearTimeout(seenTimeoutRef.current);
                seenTimeoutRef.current = setTimeout(() => {
                    markMessagesAsSeen();
                }, 500);
            }
        },
        [userId, markMessagesAsSeen]
    );

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(
                    `https://coverence-backend.onrender.com/api/chat/${receiverId}/messages/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessages(response.data);
                await markMessagesAsSeen();
                setLoadingMessages(false);
            } catch (error) {
                console.error("Failed to load or mark messages:", error);
                setLoadingMessages(false);
            }
        };

        const loadReceiverInfo = async () => {
            try {
                const response = await axios.get(
                    `https://coverence-backend.onrender.com/api/users/${receiverId}/public-profile/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReceiverInfo(response.data);
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        };

        fetchHistory();
        loadReceiverInfo();
    }, [receiverId, token, markMessagesAsSeen]);

    useEffect(() => {
        const socket = new WebSocket(
            `wss://coverence-backend.onrender.com/ws/chat/${receiverId}/?token=${token}`
        );

        socket.onopen = () => console.log("Chat WebSocket connected");

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "typing") {
                if (String(data.sender_id) !== userId) {
                    setTypingStatus(data.typing);
                }
                return;
            }

            if (data.type === "status" && String(data.user_id) === receiverId) {
                if (data.status === "online") {
                    setReceiverStatus({ online: true, lastSeen: null });
                } else if (data.status === "offline") {
                    setReceiverStatus({
                        online: false,
                        lastSeen: data.last_seen,
                    });
                }
                return;
            }

            handleIncomingMessage(data);
        };

        socket.onclose = () => console.log("Chat WebSocket disconnected");
        setWs(socket);

        return () => {
            socket.close();
            if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
        };
    }, [receiverId, token, userId, handleIncomingMessage]);

    useEffect(() => {
        if (!globalSocket) return;

        const handleStatus = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "status" && String(data.user_id) === receiverId) {
                if (data.status === "online") {
                    setReceiverStatus({ online: true, lastSeen: null });
                } else if (data.status.startsWith("last_seen:")) {
                    const timestamp = data.status.split("last_seen:")[1];
                    setReceiverStatus({ online: false, lastSeen: timestamp });
                }
            }
        };

        globalSocket.addEventListener("message", handleStatus);
        return () => globalSocket.removeEventListener("message", handleStatus);
    }, [globalSocket, receiverId]);

    useEffect(() => {
        if (loadingMessages) return;

        if (isFirstLoad.current) {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
            isFirstLoad.current = false;
        } else {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loadingMessages]);

    const togglePopup = () => {
        setShowPopup((prev) => !prev);
    };

    const sendMessage = () => {
        if (newMessage.trim() === "") return;
        ws.send(JSON.stringify({ message: newMessage }));
        setNewMessage("");
        sendTypingStatus(false);
    };

    const sendTypingStatus = (status) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ typing: status }));
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        sendTypingStatus(true);

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(false);
        }, 1500);
    };

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <ChatContainer>
            {receiverInfo && (
                <ChatHeader>
                    <BackButton onClick={() => navigate(-1)}>
                        <img src={ArrowLeft} alt="Back" />
                    </BackButton>
                    <UserInfo
                        onClick={() =>
                            navigate(`/home/profile/${receiverInfo.id}`)
                        }
                        style={{ cursor: "pointer" }}
                    >
                        {receiverInfo.profile_image ? (
                            <ProfileImage
                                src={receiverInfo.profile_image}
                                alt="Profile"
                            />
                        ) : (
                            <ProfileImagePlaceholder />
                        )}
                        <div>
                            <UserName>
                                {receiverInfo.first_name}{" "}
                                {receiverInfo.last_name}
                            </UserName>
                            <UserStatus>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={
                                            receiverStatus.online
                                                ? "online"
                                                : receiverStatus.lastSeen ||
                                                  "offline"
                                        }
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            color: receiverStatus.online
                                                ? "#00df00"
                                                : "#ccc",
                                        }}
                                    >
                                        {receiverStatus.online
                                            ? "online"
                                            : receiverStatus.lastSeen
                                            ? `Last seen ${formatLastSeen(
                                                  receiverStatus.lastSeen
                                              )}`
                                            : "offline"}
                                    </motion.span>
                                </AnimatePresence>
                            </UserStatus>
                        </div>
                    </UserInfo>
                </ChatHeader>
            )}

            <MessageArea>
                {showPopup && <MediaPopUp onClose={togglePopup} />}
                {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                    <DateGroup key={dateKey}>
                        <StickyDateHeading>
                            {formatDateHeading(msgs[0].timestamp)}
                        </StickyDateHeading>
                        <AnimatePresence initial={false}>
                            {msgs.map((msg, index) => {
                                const isOwn = String(msg.sender_id) === userId;
                                return (
                                    <motion.div
                                        key={msg.timestamp + index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MessageRow isOwn={isOwn}>
                                            <MessageBubble isOwn={isOwn}>
                                                <div>{msg.content}</div>
                                                <TimeText isOwn={isOwn}>
                                                    {new Date(
                                                        msg.timestamp
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </TimeText>
                                            </MessageBubble>
                                        </MessageRow>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </DateGroup>
                ))}
                {typingStatus && (
                    <TypingIndicator>
                        <Dot />
                        <Dot />
                        <Dot />
                    </TypingIndicator>
                )}

                <div ref={bottomRef}></div>
            </MessageArea>

            <InputArea>
                <div>
                    <AddButton onClick={togglePopup} isOpen={showPopup}>
                        <img src={PlusIcon} alt="add" />
                    </AddButton>
                </div>
                <MessageInput
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type message..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <MicButton>
                    <img src={Mic} alt="Mic" />
                </MicButton>
                <SendButton onClick={sendMessage}>
                    <img src={SendIcon} alt="send" />
                </SendButton>
            </InputArea>
        </ChatContainer>
    );
};

export default Chat;

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #121212;
    color: #e0e0e0;
`;

const ChatHeader = styled.div`
    width: 100%;
    /* height: 5rem; */
    display: flex;
    align-items: center;
    justify-items: center;
    position: fixed;
    background: #ababab6b;
    z-index: 9;
    backdrop-filter: blur(36px);
    padding: 21px 18px 19px 13px;
    margin-top: -1px;

    @media (max-width: 480px) {
        padding: 18.2px 13px 13.2px 6px;
    }
`;

const BackButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 10px;

    img {
        width: 47px;
        transform: rotate(180deg);
        filter: invert(33%) sepia(98%) saturate(1200%) hue-rotate(180deg)
            brightness(110%) contrast(95%);

        @media (max-width: 480px) {
            width: 38px;
        }
    }
    &:hover {
        opacity: 0.9;
    }

    @media (max-width: 480px) {
        margin-right: 0px;
    }
`;

const ProfileImage = styled.img`
    width: 54px;
    height: 54px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;

    @media (max-width: 480px) {
        width: 44px;
        height: 44px;
    }
`;

const ProfileImagePlaceholder = styled.div`
    width: 54px;
    height: 54px;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
    margin-left: 8px;
    background-color: #3c3c3c;

    @media (max-width: 480px) {
        width: 46px;
        height: 46px;
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
`;

const UserName = styled.div`
    font-size: 22px;
    font-weight: bold;
    color: #ffffff;
    margin-top: -2px;

    @media (max-width: 480px) {
        font-size: 18px;
        margin-top: -5px;
        margin-bottom: -4px;
    }
`;

const UserStatus = styled.span`
    font-size: 14px;
    font-weight: 400;
    margin-left: 1px;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        font-size: 11px;
    }
`;

const MessageArea = styled.div`
    height: 98vh;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 95px 19px 135px 38px;
    background-color: #0b0b0b;
    position: relative;

    &::-webkit-scrollbar {
        width: 3.5px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #8b8b8b;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    @media (max-width: 480px) {
        height: 95vh;
        -webkit-overflow-scrolling: touch;
        padding: 82px 14px 135px 15px;
    }
`;

const DateGroup = styled.div``;

const TypingIndicator = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 10px 0;
    padding: 16px 16px;
    background-color: #a7a7a7;
    border-radius: 18px;
    width: fit-content;
    animation: fadeIn 0.3s ease-in-out;

    &::before {
        content: "";
        position: absolute;
        bottom: 3px;
        left: 1px;
        width: 8px;
        height: 10px;
        background-color: #a7a7a7;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 25px;
        transform: rotate(30deg);
    }

    @media (max-width: 480px) {
        padding: 15px 17px;
        border-radius: 20px;
    }
`;

const Dot = styled.span`
    width: 6.5px;
    height: 6.5px;
    margin: 0 3px;
    background-color: #262424;
    border-radius: 50%;
    display: inline-block;
    animation: typingWave 1.1s infinite ease-in-out;

    &:nth-child(1) {
        animation-delay: 0s;
    }
    &:nth-child(2) {
        animation-delay: 0.2s;
    }
    &:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes typingWave {
        0%,
        60%,
        100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-4px);
        }
    }

    @media (max-width: 480px) {
        width: 5.5px;
        height: 5.5px;
    }
`;

const StickyDateHeading = styled.div`
    position: sticky;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1b1b1b;
    padding: 6px 14px;
    font-size: 11px;
    color: #989898;
    z-index: 2;
    border-radius: 20px;
    display: inline-block;

    @media (max-width: 480px) {
        padding: 5px 13px;
        font-size: 8.22px;
        background-color: #1e1e1e63;
        backdrop-filter: blur(8px);
    }
`;

const MessageRow = styled.div`
    display: flex;
    justify-content: ${(props) => (props.isOwn ? "flex-end" : "flex-start")};
    margin: 10px 0;
`;

const MessageBubble = styled.div`
    position: relative;
    background-color: ${(props) => (props.isOwn ? "#247fd0" : "#a7a7a7")};
    color: ${(props) => (props.isOwn ? "#fff" : "#262424")};
    padding: 10px 19px 4px;
    border-radius: 19px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    margin: 4px 0;

    div {
        max-width: 380px;
        margin-top: -3px;
        line-height: 1.3;
        font-family: "Figtree", sans-serif;
        font-weight: 500;

        @media (max-width: 480px) {
            max-width: 218px;
            font-size: 14px;
        }
    }

    @media (max-width: 480px) {
        padding: 8.5px 18px 4px;
        border-radius: 17px;
    }

    &::before {
        content: "";
        position: absolute;
        bottom: 3px;
        ${(props) => (props.isOwn ? "right: -1px;" : "left: 1px;")}
        width: 8px;
        height: ${(props) => (props.isOwn ? "15px" : "10px")};
        background-color: ${(props) => (props.isOwn ? "#247fd0" : "#a7a7a7")};
        border-bottom-left-radius: ${(props) => (props.isOwn ? "12px" : "0px")};
        border-bottom-right-radius: ${(props) =>
            props.isOwn ? "0px" : "25px"};
        transform: ${(props) =>
            props.isOwn ? "rotate(-11deg)" : "rotate(23deg)"};
    }
`;

const TimeText = styled.span`
    display: block;
    font-size: 10px;
    text-align: right;
    color: ${(props) => (props.isOwn ? "#fff" : "#000")};
    margin-top: 2px;
`;

const InputArea = styled.div`
    width: 85%;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-items: center;
    position: fixed;
    bottom: 0;
    background: #212121c7;
    z-index: 9;
    backdrop-filter: blur(36px);
    padding: 32px 18px 32px 13px;

    @media (max-width: 1024px) {
        width: 83%;
    }

    @media (max-width: 768px) {
        width: 83%;
    }

    @media (max-width: 480px) {
        width: 100%;
        height: 9%;
        padding: 28.5px 10px 33px 10px;
    }
`;

const AddButton = styled.button`
    width: 32px;
    height: 32px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    margin-right: 18px;
    background: #ffffffed;
    border-radius: 50%;
    filter: invert(72%);
    transition: box-shadow 0.3s ease;
    border: none;
    box-shadow: ${({ isOpen }) =>
        isOpen ? "0 0 14px rgb(227 227 227)" : "none"};

    &:hover {
        box-shadow: 0 0 14px rgb(227 227 227);
    }
    img {
        display: inline-block;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
        transform: ${({ isOpen }) =>
            isOpen ? "rotate(135deg)" : "rotate(0deg)"};
    }

    @media (max-width: 480px) {
        width: 26px;
        height: 26px;
        margin-left: 3.5px;
        margin-right: 8.2px;
    }
`;

const MessageInput = styled.input`
    width: 86%;
    max-width: 100%;
    padding: 11px 40px 12px 28px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 20px;
    border: none;
    background-color: #737373;
    color: rgb(221, 221, 221);
    outline: none;
    font-family: "Figtree", sans-serif;

    &::placeholder {
        font-size: 16px;
        color: rgb(176, 176, 176);
        font-weight: 600;
        font-family: "Figtree", sans-serif;

        @media (max-width: 480px) {
            font-size: 16px;
        }
    }

    @media (max-width: 480px) {
        font-size: 16px;
        padding: 6px 35px 8px 28px;
    }
`;

const MicButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    left: -35px;
    background: #ccc;
    border-radius: 50%;
    img {
        display: inline-block;
        width: 28px;
        height: 28px;

        @media (max-width: 480px) {
            width: 25px;
            height: 25px;
        }
    }
    @media (max-width: 480px) {
        left: -30px;
    }
`;

const SendButton = styled.button`
    padding: 9px 13px;
    margin-left: -20px;
    margin-right: 30px;
    border: none;
    border-radius: 20px;
    cursor: default;
    background: none;

    img {
        width: 30px;
        height: 30px;
        display: inline-block;

        @media (max-width: 480px) {
            width: 23px;
            height: 24px;
            margin-left: 3px;
        }
    }

    @media (max-width: 480px) {
        margin-right: 0;
        padding: 0;
    }
`;
