import React, { useEffect, useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import CrossImg from "../../assets/Icons/cross.png";

const FollowingModal = ({ userId, onClose }) => {
    const [followers, setFollowers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [unfollowUserId, setUnfollowUserId] = useState(null); // for showing popup
    const isMobile = window.innerWidth <= 480;

    const loggedInUserId = localStorage.getItem("userId")?.toString();

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get(
                `https://coverence-backend.onrender.com/api/users/${userId}/followinglist/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((res) => {
                setFollowers(res.data);
                setError("");
            })
            .catch(() => setError("Failed to fetch followers."));
    }, [userId]);

    const filteredFollowers = followers.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const handleUnfollowClick = (id) => {
        setUnfollowUserId(id);
    };

    const cancelUnfollow = () => {
        setUnfollowUserId(null);
    };

    const confirmUnfollow = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `https://coverence-backend.onrender.com/api/users/${id}/unfollow/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            window.location.reload();
        } catch (err) {
            console.error("Error unfollowing user:", err);
        }
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <Header>
                    <h2>Following</h2>
                    <CloseButton onClick={onClose}>
                        <img src={CrossImg} alt="Back" />
                    </CloseButton>
                </Header>
                <ScrollableContent>
                    <SearchInput
                        type="text"
                        placeholder="Search following"
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

                    {filteredFollowers.map((user) => {
                        const isOwnProfile =
                            user.id.toString() === loggedInUserId;
                        const showUnfollowPopup = unfollowUserId === user.id;

                        return (
                            <UserCardWrapper key={user.id}>
                                <StyledLink
                                    to={`/home/profile/${user.id}`}
                                    onClick={onClose}
                                    style={{ flexGrow: 1 }}
                                >
                                    <UserCard>
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
                                                {user.first_name}{" "}
                                                {user.last_name}
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
                                    </UserCard>
                                </StyledLink>

                                {!isOwnProfile && (
                                    <ButtonWrapper>
                                        {!showUnfollowPopup ? (
                                            <FollowingBtn
                                                onClick={() =>
                                                    handleUnfollowClick(user.id)
                                                }
                                            >
                                                Unfollow
                                            </FollowingBtn>
                                        ) : (
                                            <UnfollowPopup>
                                                <UnfollowConfirmText>
                                                    Unfollow {user.first_name}{" "}
                                                    {user.last_name}?
                                                </UnfollowConfirmText>
                                                <div>
                                                    <UnfollowBtn
                                                        onClick={() =>
                                                            confirmUnfollow(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        Unfollow
                                                    </UnfollowBtn>
                                                    <CancelBtn
                                                        onClick={cancelUnfollow}
                                                    >
                                                        Cancel
                                                    </CancelBtn>
                                                </div>
                                            </UnfollowPopup>
                                        )}
                                    </ButtonWrapper>
                                )}
                            </UserCardWrapper>
                        );
                    })}
                </ScrollableContent>
            </ModalContent>
        </ModalOverlay>
    );
};

export default FollowingModal;

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
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
        width: 10px;
        height: 3px;
        margin-bottom: 40px;
    }

    @media (max-width: 480px) {
        padding: 10px 10px 0rem;
        &::-webkit-scrollbar {
            width: 4px;
        }
    }
`;

const UserCardWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const UserCard = styled.div`
    display: flex;
    align-items: center;
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

const StyledLink = styled(Link)`
    text-decoration: none;
    color: inherit;

    &:hover {
        opacity: 0.9;
    }
`;

const ButtonWrapper = styled.div`
    position: relative;
`;

const FollowingBtn = styled.button`
    background-color: rgb(242 54 54);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: default;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: rgb(206 41 41);
        cursor: default;
    }

    @media (max-width: 480px) {
        font-size: 8px;
        padding: 5px 8px;
        border-radius: 7px;
    }
`;
const growIn = keyframes`
  0% {
    transform: scale(0.1);
    opacity: 0;
    transform-origin: bottom right;
  }
  100% {
    transform: scale(1);
    opacity: 1;
    transform-origin: bottom right;
  }
`;

const UnfollowBtn = styled.button`
    background-color: rgb(252 41 41);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 11px;
    cursor: pointer;
    font-size: 10px;
    margin-right: 8px;
    font-weight: 600;

    @media (max-width: 480px) {
        font-size: 8px;
        padding: 7px 10px;
    }
`;

const UnfollowPopup = styled.div`
    width: 14rem;
    height: 5.4rem;
    position: absolute;
    bottom: -19px;
    right: 5px;
    background-color: #7e7e7ee0;
    padding: 11px;
    border-radius: 20px;
    gap: 10px;
    align-items: center;
    z-index: 1000;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    backdrop-filter: blur(3px);
    animation: ${growIn} 0.2s ease-out;
`;

const UnfollowConfirmText = styled.span`
    font-size: 14px;
    color: #fff;
    font-family: "Figtree", sans-serif;
    font-weight: 600;
    margin-top: 8px;
    @media (max-width: 480px) {
        font-size: 13px;
    }
`;

const CancelBtn = styled.button`
    background: #353535;
    border: none;
    color: #eeeeee;
    cursor: pointer;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 8px;

    &:hover {
        color: white;
        font-weight: 500;
    }

    @media (max-width: 480px) {
        font-size: 9px;
    }
`;
