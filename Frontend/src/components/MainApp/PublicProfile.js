import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import Menu from "../../assets/Icons/paragraph.png";
import { useSidebar } from "../context/SidebarContext";

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { setShowSidebar } = useSidebar();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await axios.get(
                    `https://coverence-backend.onrender.com/api/users/${userId}/public-profile/`
                );

                setUser(profileRes.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile");
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        } else {
            setError("Invalid user ID");
            setIsLoading(false);
        }
    }, [userId]);

    const handleMessage = () => {
        const recentChats =
            JSON.parse(localStorage.getItem("recentChats")) || [];
        const alreadyExists = recentChats.find((u) => u.id === user.id);

        if (!alreadyExists) {
            recentChats.push({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_image: user.profile_image,
            });
            localStorage.setItem("recentChats", JSON.stringify(recentChats));
        }

        navigate(`/home/chat/${user.id}`);
    };

    if (error) return <ErrorMessage>{error}</ErrorMessage>;
    if (isLoading) return null;

    const isMobile = window.innerWidth <= 480;

    return (
        <>
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
                    <Heading>{user.first_name}'s Profile</Heading>
                </div>
                <MenuButton onClick={() => setShowSidebar(true)}>
                    <img src={Menu} alt="menu" />
                </MenuButton>
            </SectionTitle>

            <ProfileContainer>
                <TopRow>
                    {user.profile_image ? (
                        <ProfileImage src={user.profile_image} alt="Profile" />
                    ) : (
                        <ProfileImagePlaceholder />
                    )}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            maxHeight: isMobile ? "unset" : "12rem",
                            gap: isMobile ? "7px" : "12px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                maxHeight: "61px",
                                alignItems: "center",
                            }}
                        >
                            <Name>
                                {user.first_name} {user.last_name}
                            </Name>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Field2>
                                {user.skill_known && (
                                    <span>{user.skill_known}</span>
                                )}
                            </Field2>
                            <Field2>
                                {user.skill_wanted && (
                                    <span>
                                        like to learn <p>{user.skill_wanted}</p>
                                    </span>
                                )}
                            </Field2>
                            <Field3>
                                {user.available_time && (
                                    <span>{user.available_time}</span>
                                )}
                            </Field3>
                        </div>
                        <div>
                            <MessageButton onClick={handleMessage}>
                                Message
                            </MessageButton>
                        </div>
                    </div>
                </TopRow>
                <Field>
                    {user.bio.split("\n").map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}
                </Field>
            </ProfileContainer>
        </>
    );
};

export default PublicProfile;

const SectionTitle = styled.div`
    display: none;
    @media (max-width: 480px) {
        width: 100%;
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        background: #00000040;
        z-index: 9;
        backdrop-filter: blur(36px);
        padding: 35px 13px 35px 13px;
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
            width: 34px;
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
        font-size: 21px;
    }
`;

const MenuButton = styled.button`
    display: none;

    img {
        margin-top: 2px;
        width: 22px;
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

const ProfileContainer = styled.div`
    width: 88%;
    margin: auto;
    padding: 4.5rem 9rem;
    color: white;
    border-bottom: 1px solid #2c2c2c;

    @media (max-width: 480px) {
        margin: auto;
        padding: 0px;
        color: white;
        border-bottom: none;
        padding: 102px 20px 2px 20px;
        transform: scale(1.28);
    }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-right: 2rem;

    @media (max-width: 480px) {
        margin-right: 0;
        height: unset;
    }
`;

const ProfileImage = styled.img`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
        width: 78px;
        height: 78px;
        margin-right: 5px;
        margin-bottom: 10px;
    }
`;

const ProfileImagePlaceholder = styled.div`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-color: #525252;
    margin-bottom: 1rem;
    margin-right: 3rem;
    @media (max-width: 480px) {
        width: 78px;
        height: 78px;
        margin-right: 5px;
        margin-bottom: 10px;
    }
`;

const Name = styled.h2`
    font-size: 32px;
    font-weight: 700;

    @media (max-width: 480px) {
        font-size: 17px;
        margin-right: 12px;
        font-weight: 700;
        margin-bottom: 8px;
    }
`;

const Field2 = styled.p`
    span {
        font-size: 14px;
        margin-right: 13px;
        margin-left: -2px;
        padding: 0.3rem 0.8rem;
        background: #202020;
        text-align: center;
        border-radius: 12px;
        font-weight: 500;
        p {
            display: inline-block;
            font-weight: 600;
        }
        @media (max-width: 480px) {
            font-size: 8px;
            padding: 3px 7px;
            margin-right: 6px;
            border-radius: 6px;
        }
    }
`;

const Field3 = styled.p`
    span {
        font-size: 13px;
        display: inline-block;
        background: #eb922b;
        padding: 4px 7px;
        border-radius: 9px;
        color: #000;
        text-align: center;

        @media (max-width: 480px) {
            font-size: 7.2px;
            padding: 3px 7px;
            font-weight: 600;
            border-radius: 8px;
        }
    }
`;

const MessageButton = styled.button`
    border: none;
    margin-top: 4px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    padding: 8px 18px;
    cursor: pointer;
    margin-left: 1rem;
    color: #000;

    @media (max-width: 480px) {
        font-size: 8px;
        padding: 4px 15px;
        margin-left: 6px;
        border-radius: 7px;
        margin-top: 10px;
        color: #000;
    }
`;

const ErrorMessage = styled.p`
    color: red;
    text-align: center;
    margin-top: 2rem;
`;

const Field = styled.p`
    font-size: 18px;
    font-weight: 600;
    color: #b9b9b9;
    margin: 26px auto;
    max-width: 26rem;
    line-height: 1.3;
    font-family: "Figtree", sans-serif;

    div {
        margin-top: 4px;
        white-space: pre-wrap;
    }

    @media (max-width: 480px) {
        font-size: 11.6px;
        max-width: 12.9rem;
        margin: 11px auto;
        font-weight: 500;
    }
`;
