import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import homeIcon from "../../assets/Icons/home.png";
import searchIcon from "../../assets/Icons/search.png";
import messagesIcon from "../../assets/Icons/chat-bubble.png";
import settingsIcon from "../../assets/Icons/setting.png";
import logoutIcon from "../../assets/Icons/logout.png";
import { useSidebar } from "../context/SidebarContext";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useContext(AuthContext);
    const { showSidebar, setShowSidebar, unseenMessagesCount } = useSidebar();
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const isMobile = window.innerWidth <= 480;
    const [profileImage, setProfileImage] = useState(null);
    const [username, setUsername] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("userId");
        setUser(null);
        navigate("/login");
    };

    // Fetch profile info
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(
                    "https://coverence-backend.onrender.com/api/users/profile/",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProfileImage(res.data.profile_image || null);
                setUsername(res.data.username || "");
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    const navItems = [
        { label: "Home", path: "/home/homepage", icon: homeIcon },
        { label: "Search", path: "/home/search", icon: searchIcon },
        {
            label: username || "Profile",
            path: username ? `/home/${username}` : "/home/profile",
            icon: profileImage || null,
            isProfile: true,
        },
        {
            label: "Messages",
            path: "/home/message",
            icon: messagesIcon,
            unseenMessagesCount,
            showBadge: unseenMessagesCount > 0,
        },
        { label: "Settings", path: "/home/settings", icon: settingsIcon },
    ];

    const handleSidebarClose = () => {
        if (isMobile) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsAnimatingOut(false);
                setShowSidebar(false);
            }, 300);
        }
    };

    return (
        <>
            {(showSidebar || isAnimatingOut || !isMobile) && (
                <ResPSidebarContainer onClick={handleSidebarClose}>
                    <SidebarContainer
                        onClick={(e) => e.stopPropagation()}
                        isExiting={isAnimatingOut}
                    >
                        <div>
                            <Title>Coverence</Title>
                            {navItems.map((item, index) => {
                                let isActive = false;
                                if (item.label === "Home")
                                    isActive = location.pathname === "/home";
                                else if (item.label === "Search")
                                    isActive =
                                        location.pathname.startsWith(
                                            "/home/search"
                                        ) ||
                                        (location.pathname.startsWith(
                                            "/home/profile/"
                                        ) &&
                                            location.state?.fromSearch);
                                else if (item.label === "Messages")
                                    isActive =
                                        location.pathname.startsWith(
                                            "/home/message"
                                        ) ||
                                        location.pathname.startsWith(
                                            "/home/chat"
                                        );
                                else if (item.isProfile) {
                                    const path = location.pathname;
                                    const isOwnProfilePath =
                                        path === "/home/profile" ||
                                        path === "/home/edit" ||
                                        (username &&
                                            path === `/home/${username}`);
                                    isActive = isOwnProfilePath;
                                } else if (item.path)
                                    isActive = location.pathname.startsWith(
                                        item.path
                                    );

                                return (
                                    <NavButton
                                        key={index}
                                        active={isActive}
                                        onClick={() => {
                                            navigate(item.path);
                                            if (isMobile) setShowSidebar(false);
                                        }}
                                    >
                                        {item.isProfile ? (
                                            <ProfileImageIcon
                                                src={item.icon}
                                                active={isActive}
                                            />
                                        ) : (
                                            <IconWrapper>
                                                <Icon
                                                    src={item.icon}
                                                    alt={`${item.label} icon`}
                                                />
                                                {item.showBadge && (
                                                    <BubbleCount>
                                                        {
                                                            item.unseenMessagesCount
                                                        }
                                                    </BubbleCount>
                                                )}
                                            </IconWrapper>
                                        )}
                                        {item.label}
                                    </NavButton>
                                );
                            })}
                        </div>

                        <NavButton className="logout" onClick={handleLogout}>
                            <Icon src={logoutIcon} alt="Logout icon" />
                            Logout
                        </NavButton>
                    </SidebarContainer>
                </ResPSidebarContainer>
            )}
        </>
    );
};

export default Sidebar;

const ResPSidebarContainer = styled.div`
    @media (max-width: 480px) {
        width: 100%;
        height: 100dvh;
        position: fixed;
        z-index: 999;
        background: #1a1a1a82;
        backdrop-filter: blur(12px);
        overflow-y: hidden;
    }
`;

const slideInSidebar = keyframes`
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideOutSidebar = keyframes`
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const SidebarContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px 20px;
    background: #0e0e0e;
    overflow-y: hidden;
    transition: transform 0.3s ease, opacity 0.3s ease;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #8b8b8b;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    @media (max-width: 768px) {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overflow-x: hidden;
        padding: 8px 10px;
    }

    @media (max-width: 480px) {
        width: 80.5%;
        overflow-y: auto;
        position: absolute;
        z-index: 999;
        background: #000;
        backdrop-filter: blur(21px);
        padding: 0px 69px;
        animation: ${(props) =>
                props.isExiting ? slideOutSidebar : slideInSidebar}
            0.2s ease-in-out forwards;
    }
`;

const Title = styled.h1`
    color: #fff;
    font-size: 2.5rem;
    text-align: center;
    font-weight: 600;
    margin-top: 12px;
    margin-bottom: 4rem;
    margin-right: 8px;
    font-family: "Outfit";

    @media (max-width: 1024px) {
        font-size: 2.5rem;
        margin-bottom: 3rem;
    }

    @media (max-width: 768px) {
        font-size: 1.9rem;
        margin-bottom: 3rem;
        margin-top: 22px;
    }
    @media (max-width: 480px) {
        font-size: 2.1rem;
        margin-bottom: 3.2rem;
        margin-top: 26px;
        font-weight: bold;
        font-family: "Figtree", sans-serif;
        font-family: "Outfit";
    }
`;

const NavButton = styled.button`
    all: unset;
    display: flex;
    align-items: center;
    width: 84%;
    gap: 18px;
    margin-top: 34px;
    padding: 9px 16px;
    border-radius: 14px;
    font-size: 19px;
    cursor: pointer;
    font-weight: ${({ active }) => (active ? "600" : "500")};
    color: ${({ active }) => (active ? "#fff" : "#e7e7e7")};
    background-color: ${({ active }) => (active ? "#2f2f2f52" : "transparent")};
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
        background-color: #292a2a66;
    }

    &.logout {
        font-weight: 600;
        color: #fff;
        margin-bottom: 8rem;
    }

    &.logout:hover {
        background: #fff;
        color: #000;
    }

    &.logout:hover img {
        filter: none;
    }

    @media (max-width: 1024px) {
        transform: scale(0.88);
        width: 89%;
        gap: 8px;
        margin-bottom: 26px;
    }

    @media (max-width: 768px) {
        transform: scale(0.65);
        width: 130%;
        padding: 13px 13px;
        margin-left: -32px;
        margin-bottom: 12px;
        margin-top: 20px;
    }

    @media (max-width: 480px) {
        transform: scale(0.9);
        width: 91%;
        padding: 10px 28px;
        border-radius: 18px;
        margin-left: -42px;
    }
`;

const Icon = styled.img`
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: invert(1);
    margin-top: 4px;
`;

const IconWrapper = styled.div`
    position: relative;
`;

const BubbleCount = styled.div`
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -7px;
    top: -1px;
    color: white;
    font-size: 11px;
    font-weight: 600;
    border-radius: 999px;
    padding: 2px 6px;
    background-color: #ff3b30;
`;

const ProfileImageIcon = styled.div`
    width: 29px;
    height: 29px;
    border-radius: 50%;
    border: ${({ active }) => (active ? "2px solid #fff" : "1px solid #fff")};
    background-color: #525252;
    background-image: ${({ src }) => (src ? `url(${src})` : "none")};
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
`;
