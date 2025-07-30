import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import envConfig from "../../conf/envConfiq";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(`${envConfig.BaseUrl}/users/me`, {
                withCredentials: true,
            });
            setUser(response.data.data);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const logout = async () => {
        await axios.post(
            `${envConfig.BaseUrl}/users/logout`,
            {},
            { withCredentials: true }
        );
        setUser(null);
    };

    const value = { user, isLoading, refetchUser: checkAuthStatus, logout };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
