// src/components/context/SidebarContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { WebSocketContext } from "./WebSocketProvider";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);

    const socket = useContext(WebSocketContext);

    // Fetch initial unseen messages count
    const fetchUnseenMessages = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await axios.get(
                "https://coverence-backend.onrender.com/api/chat/recent/",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUnseenMessagesCount(res.data.total_unseen_messages || 0);
        } catch (err) {
            console.error("Error fetching unseen messages", err);
        }
    };

    useEffect(() => {
        fetchUnseenMessages();
    }, []);

    // Listen to WebSocket messages globally
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "new_message") {
                const currentPath = window.location.pathname;
                const currentChatUserId = currentPath.includes("/home/chat/")
                    ? currentPath.split("/").pop()
                    : null;

                // Only increment if the user is not currently viewing that chat
                if (String(data.sender_id) !== currentChatUserId) {
                    setUnseenMessagesCount((prev) => prev + 1);
                }
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    return (
        <SidebarContext.Provider
            value={{
                showSidebar,
                setShowSidebar,
                unseenMessagesCount,
                setUnseenMessagesCount,
                fetchUnseenMessages, // expose to refresh from Message.js if needed
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
