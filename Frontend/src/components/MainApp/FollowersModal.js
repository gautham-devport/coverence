import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Link } from "react-router-dom";
import CrossImg from "../../assets/Icons/cross.png";

const FollowersModal = ({ userId, onClose }) => {
    const [followers, setFollowers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    const isMobile = window.innerWidth <= 480;

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get(
                `https://coverence-backend.onrender.com/api/users/${userId}/followerslist/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => setFollowers(res.data))
            .catch(() => setError("Failed to fetch followers."));
    }, [userId]);

    const handleClose = () => {
        onClose();
        window.location.reload();
    };

    const handleFollowBack = async (followerId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `https://coverence-backend.onrender.com/api/users/${followerId}/follow/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setFollowers((prev) =>
                prev.map((user) =>
                    user.id === followerId
                        ? { ...user, is_following_back: true }
                        : user
                )
            );
        } catch (err) {
            console.error("Error following back", err);
        }
    };

    const filteredFollowers = followers.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    return (
        <ModalOverlay>
            <ModalContent>
                <Header>
                    <h2>Followers</h2>
                    <CloseButton onClick={handleClose}>
                        <img src={CrossImg} alt="Back" />
                    </CloseButton>
                </Header>

                <ScrollableContent>
                    <SearchInput
                        type="text"
                        placeholder="Search followers"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {error && <p>{error}</p>}
                    {filteredFollowers.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "14px",
                            }}
                        >
                            No User found
                        </div>
                    )}
                    {filteredFollowers.map((user) => (
                        <UserCard key={user.id}>
                            <Link
                                to={`/home/profile/${user.id}`}
                                onClick={onClose}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    flex: 1,
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                {user.profile_image ? (
                                    <img
                                        src={user.profile_image}
                                        alt="profile"
                                    />
                                ) : (
                                    <ProfileImagePlaceholder />
                                )}
                                <div>
                                    <span>
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <p
                                        style={{
                                            fontSize: isMobile
                                                ? "11px"
                                                : "14px",
                                            color: "#adadad",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {user.skill_known}
                                    </p>
                                </div>
                            </Link>
                            {user.is_following_back ? (
                                <FollowingButton disabled>
                                    Following
                                </FollowingButton>
                            ) : (
                                <FollowBackButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFollowBack(user.id);
                                    }}
                                >
                                    Follow back
                                </FollowBackButton>
                            )}
                        </UserCard>
                    ))}
                </ScrollableContent>
            </ModalContent>
        </ModalOverlay>
    );
};

export default FollowersModal;

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
`;

const ModalContent = styled.div`
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

    @media (max-width: 480px) {
        width: 78%;
        height: 42%;
        margin-bottom: 0px;
        margin-left: 0px;
    }

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
`;

const Header = styled.div`
    padding: 0.6rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #6b6b6b;
    font-family: "Figtree", sans-serif;
    h2 {
        font-size: 28px;
        width: 100%;
        text-align: center;

        @media (max-width: 480px) {
            font-size: 22px;
        }
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;

    img {
        width: 14px;
        height: 14px;
        filter: invert(1);
    }
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
    }

    @media (max-width: 480px) {
        padding: 6px 16px;
        &::placeholder {
            font-size: 13px;
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

const UserCard = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 0.5rem;
    border-radius: 10px;
    font-family: "Figtree", sans-serif;
    font-weight: 800;
    margin-bottom: 0.2rem;

    img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;

        @media (max-width: 480px) {
            width: 35px;
            height: 35px;
        }
    }

    @media (max-width: 480px) {
        padding: 0.6rem 0.5rem;
        font-size: 12px;
    }
`;

const ProfileImagePlaceholder = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #525252;
`;

const FollowBackButton = styled.button`
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
        padding: 6.1px 8.8px;
        border-radius: 7px;
        font-size: 7px;
    }
`;

const FollowingButton = styled.button`
    background-color: #555555;
    color: white;
    border: none;
    padding: 6px 13.8px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: default;

    @media (max-width: 480px) {
        padding: 6.1px 9.8px;
        border-radius: 7px;
        font-size: 8px;
    }
`;
