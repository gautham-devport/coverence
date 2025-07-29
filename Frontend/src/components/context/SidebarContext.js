import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);

    return (
        <SidebarContext.Provider
            value={{
                showSidebar,
                setShowSidebar,
                unseenMessagesCount,
                setUnseenMessagesCount,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
