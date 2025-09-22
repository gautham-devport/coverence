import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // logged-in user
    const [loading, setLoading] = useState(true); // check in progress

    // Function to load user on app start
    const loadUser = async () => {
        const access = localStorage.getItem("token");
        const refresh = localStorage.getItem("refresh");

        if (!access || !refresh) {
            setLoading(false);
            return;
        }

        try {
            // Try fetching profile with access token
            const res = await axios.get(
                "https://coverence-backend.onrender.com/api/users/profile/",
                { headers: { Authorization: `Bearer ${access}` } }
            );
            setUser(res.data);
        } catch (err) {
            // Access token might be expired → try refresh
            try {
                const refreshRes = await axios.post(
                    "https://coverence-backend.onrender.com/api/users/token/refresh/",
                    { refresh }
                );
                localStorage.setItem("token", refreshRes.data.access);

                const res2 = await axios.get(
                    "https://coverence-backend.onrender.com/api/users/profile/",
                    {
                        headers: {
                            Authorization: `Bearer ${refreshRes.data.access}`,
                        },
                    }
                );
                setUser(res2.data);
            } catch (err) {
                console.log("Auto-login failed", err);
                localStorage.removeItem("token");
                localStorage.removeItem("refresh");
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
