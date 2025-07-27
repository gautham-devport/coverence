import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import CrossImg from "../../assets/Icons/cross.png";
import { useNavigate } from "react-router-dom";

const PublicModal = ({ userId, loggedInUserId, type, onClose }) => {
    const [popupUsers, setPopupUsers] = useState([]);
    const [popupLoading, setPopupLoading] = useState(false);
    const [popupError, setPopupError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    const popupTitle = type === "followers" ? "Followers" : "Following";

    useEffect(() => {
        const fetchUsers = async () => {
            setPopupLoading(true);
            setPopupError("");
            setPopupUsers([]);
            setSearchTerm("");

            try {
                const token = localStorage.getItem("token");
                const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};
                const url =
                    type === "followers"
                        ? `https://coverence-backend.onrender.com/api/users/${userId}/followerslist/`
                        : `https://coverence-backend.onrender.com/api/users/${userId}/followinglist/`;

                const res = await axios.get(url, { headers });
                const allUsers = res.data;

                // Separate the logged-in user
                const loggedInUser = allUsers.find(
                    (u) => u.id === parseInt(loggedInUserId)
                );
                const otherUsers = allUsers.filter(
                    (u) => u.id !== parseInt(loggedInUserId)
                );

                // Combine with logged-in user at the top
                const sortedUsers = loggedInUser
                    ? [loggedInUser, ...otherUsers]
                    : otherUsers;

                setPopupUsers(sortedUsers);
            } catch (err) {
                console.error("Error fetching user list:", err);
                setPopupError("Failed to load users");
            }
            setPopupLoading(false);
        };

        if (userId && type) {
            fetchUsers();
        }
    }, [userId, type, loggedInUserId]);

    const filteredUsers = popupUsers.filter((u) =>
        `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleUserClick = (clickedUserId) => {
        onClose();
        const isOwnProfile = clickedUserId.toString() === loggedInUserId;
        navigate(
            isOwnProfile ? "/home/profile" : `/home/profile/${clickedUserId}`
        );
    };

    const handleFollowBack = async (targetUserId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `https://coverence-backend.onrender.com/api/users/${targetUserId}/follow/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setPopupUsers((prev) =>
                prev.map((user) =>
                    user.id === targetUserId
                        ? { ...user, is_following_back: true }
                        : user
                )
            );
        } catch (err) {
            console.error("Error following back", err);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>{popupTitle}</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <img src={CrossImg} alt="Close" />
                    </CloseButton>
                </ModalHeader>

                <ScrollableContent>
                    <SearchInput
                        type="text"
                        placeholder={`Search ${
                            type === "followers" ? "followers" : "following"
                        }`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {popupLoading && <ModalText>Loading...</ModalText>}
                    {popupError && <ModalText>{popupError}</ModalText>}
                    {!popupLoading &&
                        !popupError &&
                        filteredUsers.length === 0 && (
                            <ModalText>No users found.</ModalText>
                        )}

                    <UserList>
                        {filteredUsers.map((u) => (
                            <UserCardWrapper key={u.id}>
                                <UserCard onClick={() => handleUserClick(u.id)}>
                                    {u.profile_image ? (
                                        <UserImage
                                            src={u.profile_image}
                                            alt="User"
                                        />
                                    ) : (
                                        <UserImagePlaceholder />
                                    )}
                                    <div>
                                        <UserName>
                                            {u.first_name} {u.last_name}
                                        </UserName>
                                        <UserSkill>{u.skill_known}</UserSkill>
                                    </div>
                                </UserCard>

                                {u.id !== parseInt(loggedInUserId) && (
                                    <>
                                        {u.is_following_back ? (
                                            <FollowingButton disabled>
                                                Following
                                            </FollowingButton>
                                        ) : u.is_following_you ? (
                                            <FollowBackButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFollowBack(u.id);
                                                }}
                                            >
                                                Follow back
                                            </FollowBackButton>
                                        ) : (
                                            <FollowBackButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFollowBack(u.id);
                                                }}
                                            >
                                                Follow
                                            </FollowBackButton>
                                        )}
                                    </>
                                )}
                            </UserCardWrapper>
                        ))}
                    </UserList>
                </ScrollableContent>
            </ModalBox>
        </ModalOverlay>
    );
};

export default PublicModal;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(0 0 0 / 84%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;

    @media (max-width: 480px) {
        height: 100vh;
    }
`;

const ModalBox = styled.div`
    width: 28%;
    height: 52%;
    color: white;
    background-color: #40404094;
    border-radius: 22px;
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 55px;
    margin-left: 20px;
    padding-bottom: 14px;
    animation: popIn 0.2s ease-out forwards;
    backdrop-filter: blur(11px);

    @keyframes popIn {
        0% {
            transform: scale(1.1);
            opacity: 0;
        }
        50% {
            transform: scale(0.97);
            opacity: 1;
        }
        100% {
            transform: scale(1);
        }
    }

    @media (max-width: 480px) {
        width: 69%;
        height: 33%;
        margin-bottom: 87px;
        margin-left: 0px;
    }
`;

const ModalHeader = styled.div`
    padding: 0.6rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #6b6b6b;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        padding: 0.4rem 1.5rem;
    }
`;

const ModalTitle = styled.h2`
    font-size: 28px;
    width: 100%;
    text-align: center;

    @media (max-width: 480px) {
        font-size: 20px;
    }
`;

const CloseButton = styled.span`
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;

    img {
        width: 14px;
        height: 14px;
        filter: invert(1);

        @media (max-width: 480px) {
            width: 12px;
            height: 12px;
        }
    }
`;

const ScrollableContent = styled.div`
    padding: 1rem 1rem 0rem;
    overflow-y: auto;
    height: 100%;

    &::-webkit-scrollbar {
        width: 7px;
    }

    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
        width: 10px;
        height: 3px;
        margin-bottom: 20px;
    }

    @media (max-width: 480px) {
        padding: 10px 10px 0rem;
        &::-webkit-scrollbar {
            width: 4px;
        }
    }
`;

const ModalText = styled.p`
    color: #ccc;
    text-align: center;
    margin-top: 20px;
`;

const UserList = styled.div``;

const UserCardWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
    @media (max-width: 480px) {
        gap: 6rem;
    }
`;

const UserCard = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 0.5rem;
    border-radius: 10px;
    cursor: pointer;
    font-family: "Figtree", sans-serif;
    font-weight: 800;
    margin-bottom: 0.2rem;

    @media (max-width: 480px) {
        padding: 0.6rem 0.5rem;
        font-size: 12px;
        gap: 0.7rem;
    }
`;

const UserImage = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;

    @media (max-width: 480px) {
        width: 31px;
        height: 31px;
    }
`;

const UserImagePlaceholder = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #777;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 16px;
    margin-bottom: 4px;
    border-radius: 10px;
    border: none;
    font-size: 16px;
    outline: none;
    background-color: #404040fa;
    color: #fff;

    &::placeholder {
        color: #ccc;
        font-weight: 500;
        font-size: 15px;

        @media (max-width: 480px) {
            font-size: 12px;
        }
    }

    @media (max-width: 480px) {
        font-size: 12px;
        padding: 6px 16px;
        margin-bottom: 0;
    }
`;

const UserName = styled.div`
    @media (max-width: 480px) {
        font-size: 11px;
    }
`;

const UserSkill = styled.div`
    font-size: 14px;
    color: rgb(173, 173, 173);
    font-weight: 500;

    @media (max-width: 480px) {
        font-size: 10px;
    }
`;

const FollowBackButton = styled.button`
    width: 91.2px;
    background-color: #0092ff;
    color: white;
    border: none;
    padding: 7.1px 10.8px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;

    &:hover {
        background-color: rgba(0, 145, 255, 0.81);
    }

    @media (max-width: 480px) {
        padding: 6.1px 9.8px;
        border-radius: 7px;
        font-size: 8px;
    }
`;

const FollowingButton = styled.button`
    width: 91.2px;
    background-color: #555555;
    color: white;
    border: none;
    padding: 7.1px 10.8px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 600;
    cursor: default;

    @media (max-width: 480px) {
        padding: 6.1px 9.8px;
        border-radius: 7px;
        font-size: 8px;
    }
`;
