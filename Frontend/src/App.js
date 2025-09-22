import React, { useContext } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import { SidebarProvider } from "./components/context/SidebarContext";
import { WebSocketProvider } from "./components/context/WebSocketProvider";
import { AuthProvider, AuthContext } from "./components/context/AuthContext";

import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Home from "./components/MainApp/Home";
import Profile from "./components/MainApp/Profile";
import Edit from "./components/MainApp/EditProfile";
import Search from "./components/MainApp/Search";
import PublicProfile from "./components/MainApp/PublicProfile";
import Message from "./components/MainApp/Message";
import Settings from "./components/MainApp/Settings";
import Notification from "./components/MainApp/Notification";
import Chat from "./components/MainApp/Chat";
import HomePage from "./components/MainApp/HomePage";

// PrivateRoute component to protect /home routes
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // You can add a spinner here
    return user ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <WebSocketProvider>
            <SidebarProvider>
                <AuthProvider>
                    <Router>
                        <Routes>
                            {/* Redirect root to login */}
                            <Route
                                path="/"
                                element={<Navigate to="/login" />}
                            />

                            {/* Public routes */}
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/login" element={<Login />} />

                            {/* Protected home routes */}
                            <Route
                                path="/home"
                                element={
                                    <PrivateRoute>
                                        <Home />
                                    </PrivateRoute>
                                }
                            >
                                <Route path="homepage" element={<HomePage />} />
                                <Route path="search" element={<Search />} />
                                <Route path="message" element={<Message />} />
                                <Route path="profile" element={<Profile />} />
                                <Route
                                    path="profile/:userId"
                                    element={<PublicProfile />}
                                />
                                <Route path="edit" element={<Edit />} />
                                <Route path="settings" element={<Settings />} />
                                <Route
                                    path="notification"
                                    element={<Notification />}
                                />
                                <Route
                                    path="chat/:receiverId"
                                    element={<Chat />}
                                />
                            </Route>
                        </Routes>
                    </Router>
                </AuthProvider>
            </SidebarProvider>
        </WebSocketProvider>
    );
};

export default App;
