import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../../assets/Icons/search.png";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import Menu from "../../assets/Icons/paragraph.png";
import { useSidebar } from "../context/SidebarContext";
import { WebSocketContext } from "../context/WebSocketProvider";

const Message = () => {
    const [chatUsers, setChatUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { setShowSidebar } = useSidebar();

    const socket = useContext(WebSocketContext); // Global WebSocket

    useEffect(() => {
        const shouldRefresh = localStorage.getItem("refreshMessages");
        if (shouldRefresh === "true") {
            localStorage.removeItem("refreshMessages");
        }

        const fetchChats = () => {
            axios
                .get(
                    "https://coverence-backend.onrender.com/api/chat/recent/",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                .then((res) => {
                    const sorted = res.data.chats.sort((a, b) => {
                        return (
                            new Date(b.last_message?.timestamp) -
                            new Date(a.last_message?.timestamp)
                        );
                    });
                    setChatUsers(sorted);
                })
                .catch((err) =>
                    console.error("Failed to load chat users", err)
                );
        };

        fetchChats();

        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "new_message") {
                fetchChats();
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [token, socket]);

    const filteredUsers = chatUsers.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <MainContainer>
            <SectionTitle>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <BackButton onClick={() => navigate(-1)}>
                        <img src={ArrowLeft} alt="Back" />
                    </BackButton>
                    <Heading>Messages</Heading>
                </div>
                <MenuButton onClick={() => setShowSidebar(true)}>
                    <img src={Menu} alt="menu" />
                </MenuButton>
            </SectionTitle>
            <div
                style={{
                    paddingTop: "1.7rem",
                }}
            >
                <Container>
                    <div>
                        <SearchIconCont>
                            <img src={SearchIcon} alt="" />
                        </SearchIconCont>
                        <SearchInput
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {filteredUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            onClick={() => navigate(`/home/chat/${user.id}`)}
                        >
                            {user.profile_image ? (
                                <Avatar
                                    src={user.profile_image}
                                    alt="Profile"
                                />
                            ) : (
                                <ProfileImagePlaceholder />
                            )}
                            <Info>
                                <TopRow>
                                    <Name>
                                        {user.first_name} {user.last_name}
                                    </Name>
                                    <RightSection>
                                        {user.last_message?.timestamp && (
                                            <Time>
                                                {new Date(
                                                    user.last_message.timestamp
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </Time>
                                        )}
                                        {user.unseen_count > 0 && (
                                            <Badge>{user.unseen_count}</Badge>
                                        )}
                                    </RightSection>
                                </TopRow>
                                <Preview>{user.last_message?.content}</Preview>
                            </Info>
                        </UserCard>
                    ))}
                </Container>
            </div>
        </MainContainer>
    );
};

export default Message;

const MainContainer = styled.div`
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
        width: 10px;
        height: 3px;
        margin-bottom: 20px;
    }

    @media (max-width: 480px) {
        &::-webkit-scrollbar {
            width: 3px;
        }
    }
`;

const Container = styled.div`
    width: 78%;
    margin: auto;
    padding: 20px;
    margin-top: 2rem;

    @media (max-width: 480px) {
        width: 100%;
        height: 100vh;
        padding: 0px;
        margin-top: 0px;
    }
`;

const SectionTitle = styled.div`
    width: 100%;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-items: center;
    position: fixed;
    background: #00000040;
    z-index: 9;
    backdrop-filter: blur(36px);
    padding: 48px 18px 45px 13px;

    @media (max-width: 480px) {
        display: flex;
        justify-content: space-between;
        padding: 37px 13px 36px 13px;
    }
`;

const BackButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 10px;

    @media (max-width: 480px) {
        margin-right: 4px;
    }

    img {
        width: 47px;
        transform: rotate(180deg);
        filter: invert(28%) sepia(98%) saturate(1200%) hue-rotate(180deg)
            brightness(110%) contrast(95%);

        @media (max-width: 480px) {
            width: 38px;
            margin-top: 3px;
        }
    }
    &:hover {
        opacity: 0.9;
    }
`;

const Heading = styled.h2`
    display: inline-block;
    font-weight: 700;
    font-size: 35px;
    font-family: "Figtree", sans-serif;
    @media (max-width: 480px) {
        font-size: 30px;
    }
`;

const MenuButton = styled.button`
    display: none;

    img {
        margin-top: 2px;
        width: 26px;
        filter: invert(28%) sepia(98%) saturate(1200%) hue-rotate(180deg)
            brightness(110%) contrast(95%);
        transform: scaleX(-1);
    }
    &:hover {
        opacity: 0.9;
    }

    @media (max-width: 480px) {
        display: block;
        background: none;
        border: none;
        cursor: pointer;
        margin-right: 15px;
    }
`;

const SearchIconCont = styled.span`
    position: relative;
    top: 34px;
    left: 16px;

    @media (max-width: 480px) {
        top: 65px;
        left: 22px;
    }

    img {
        width: 18px;
        height: 18px;
        display: inline-block;
        filter: invert(18%);

        @media (max-width: 480px) {
            width: 18px;
            height: 18px;
        }
    }
`;

const SearchInput = styled.input`
    width: 100%;
    display: block;
    padding: 12px 46px;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 600;
    outline: none;
    background: #adadad;
    color: rgba(12, 12, 12, 0.91);
    margin-bottom: 2rem;

    &::placeholder {
        font-size: 16px;
        color: rgb(61, 61, 61);
        font-weight: 600;
        font-family: "Figtree", sans-serif;

        @media (max-width: 480px) {
            font-size: 16px;
        }
    }
    @media (max-width: 480px) {
        width: 96%;
        padding: 10px 46px;
        margin: 32px auto 25px;
    }
`;

const UserCard = styled.div`
    height: 100px;
    display: flex;
    align-items: center;
    padding: 10px;
    background: #cccccc0f;
    border: 1px solid #2e2e2e4f;
    border-radius: 26px;
    margin-bottom: 1.3rem;
    cursor: pointer;
    &:hover {
        background: #1a1a1a;
    }
    @media (max-width: 480px) {
        height: 82px;
        background: #17171794;
        border-top: 1px solid #2e2e2e87;
        border-bottom: 1px solid #2e2e2e87;
        border-right: unset;
        border-left: unset;
        margin-bottom: 1.1rem;
        border-radius: unset;
    }
`;

const Avatar = styled.img`
    width: 62px;
    height: 62px;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
    margin-left: 8px;
    border: 1px solid #5f5f5f36;

    @media (max-width: 480px) {
        width: 62px;
        height: 52px;
    }
`;

const ProfileImagePlaceholder = styled.span`
    width: 63px;
    height: 58px;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
    margin-left: 8px;
    background-color: #2d2d2d;
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: -8px;
`;

const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Name = styled.div`
    font-size: 20px;
    font-weight: 700;
    @media (max-width: 480px) {
        font-size: 17px;
    }
`;

const Time = styled.div`
    font-size: 15px;
    color: #9e9c9c;
    margin-top: -6px;
    margin-right: 25px;
    font-weight: 600;
    font-family: "Figtree", sans-serif;
    @media (max-width: 480px) {
        font-size: 10px;
        margin-right: 12px;
    }
`;

const Preview = styled.div`
    color: #d5d5d5a3;
    font-size: 15px;
    margin-top: 4px;
    font-weight: 600;
    font-family: "Figtree", sans-serif;
    @media (max-width: 480px) {
        font-size: 14px;
        color: #d5d5d5c2;
    }
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
`;

const Badge = styled.div`
    min-width: 23px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -10px;
    top: -37px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    border-radius: 999px;
    padding: 2px 6px;
    background-color: #ff3b30;

    @media (max-width: 480px) {
        top: -26px;
    }
`;
