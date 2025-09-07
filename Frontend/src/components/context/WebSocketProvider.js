import React, { createContext, useEffect, useState } from "react";
export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!userId || !token) return;

        const ws = new WebSocket(
            `wss://coverence-backend.onrender.com/ws/notifications/${userId}/?token=${token}`
        );

        ws.onopen = () => console.log("✅ Notification WebSocket connected");
        ws.onclose = () =>
            console.log("❌ Notification WebSocket disconnected");
        ws.onerror = (err) => console.error("WebSocket error", err);

        setSocket(ws);

        const handleBeforeUnload = () => {
            ws.close();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            ws.close();
        };
    }, [userId, token]);

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    );
};
