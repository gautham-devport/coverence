import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    return (
        <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
