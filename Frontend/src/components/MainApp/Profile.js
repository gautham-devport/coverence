import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import Menu from "../../assets/Icons/paragraph.png";
import { useSidebar } from "../context/SidebarContext";

const Profile = () => {
    const [user, setUser] = useState({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        bio: "",
        skill_known: "",
        skill_wanted: "",
        available_time: "",
        profile_image: "",
    });

    const [error, setError] = useState("");

    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { setShowSidebar } = useSidebar();

    const fetchUserProfile = useCallback(async () => {
        if (!token) {
            setError("No token found, please login.");
            return;
        }

        try {
            const response = await axios.get(
                "https://coverence-backend.onrender.com/api/users/profile/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const userData = {
                ...response.data,
                id: response.data.id || null,
            };
            setUser(userData);
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setError("Failed to fetch user profile");
        }
    }, [token]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleEditProfile = () => {
        navigate("/home/edit");
    };

    if (error) return <ErrorMessage>{error}</ErrorMessage>;

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
                    <Heading>Profile</Heading>
                </div>
                <MenuButton onClick={() => setShowSidebar(true)}>
                    <img src={Menu} alt="menu" />
                </MenuButton>
            </SectionTitle>

            <ProfileContainer>
                <TopRow>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        {user.profile_image ? (
                            <ProfileImage
                                src={user.profile_image}
                                alt="Profile"
                            />
                        ) : (
                            <ProfileImagePlaceholder />
                        )}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
                                maxHeight: isMobile ? "4.4rem" : "8rem",
                                gap: isMobile ? "9px" : "12px",
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
                                <Field3>
                                    {user.available_time ? (
                                        <span>{user.available_time}</span>
                                    ) : (
                                        <div style={{ color: "blue" }}></div>
                                    )}
                                </Field3>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Field2>
                                    {user.skill_known && (
                                        <span>{user.skill_known}</span>
                                    )}
                                </Field2>
                                <Field2>
                                    {user.skill_wanted && (
                                        <span style={{ fontWeight: "300" }}>
                                            like to learn{" "}
                                            <p>{user.skill_wanted}</p>
                                        </span>
                                    )}
                                </Field2>
                                <EditButton onClick={handleEditProfile}>
                                    Edit Profile
                                </EditButton>
                            </div>
                        </div>
                    </div>
                    <Field>
                        {user.bio.split("\n").map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </Field>
                </TopRow>
            </ProfileContainer>
        </>
    );
};

export default Profile;

const ProfileContainer = styled.div`
    width: 88%;
    margin: auto;
    padding: 4.6rem 9rem;
    color: white;
    border-bottom: 1px solid #2c2c2c;

    @media (max-width: 480px) {
        margin: auto;
        padding: 0px;
        color: white;
        border-bottom: none;
    }
`;

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
        font-size: 25px;
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

const TopRow = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 2rem;
    transform: scale(1.03);

    @media (max-width: 480px) {
        padding: 99px 20px 2px 20px;
        justify-content: center;
        transform: scale(1.33);
        margin-right: 0;
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
    margin-right: 1rem;
    @media (max-width: 480px) {
        width: 78px;
        height: 78px;
        margin-right: 5px;
        margin-bottom: 10px;
    }
`;

const Name = styled.h2`
    font-size: 32px;
    margin-right: 14px;
    font-weight: 700;
    @media (max-width: 480px) {
        font-size: 17px;
        margin-right: 12px;
        font-weight: 700;
    }
`;

const Field3 = styled.p`
    span {
        font-size: 12px;
        display: inline-block;
        background: #eb922b;
        padding: 2px 5px;
        border-radius: 7px;
        color: #000;
        text-align: center;
        margin-top: 6px;
        @media (max-width: 480px) {
            font-size: 6px;
            font-weight: 600;
            margin-bottom: 3px;
        }
    }
    div {
        margin-top: 4px;
        white-space: pre-wrap;
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
            font-size: 7.7px;
            padding: 3px 7px;
            margin-right: 6px;
            border-radius: 6px;
        }
    }
`;

const EditButton = styled.button`
    display: inline-block;
    padding: 0.5rem 0.6rem;
    background-color: rgb(198, 198, 198);
    color: #000;
    border-radius: 12px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    border: 1.6px solid #272727;
    font-family: "Figtree", sans-serif;
    transition: 0.3s ease;

    &:hover {
        background-color: #fff;
    }
    @media (max-width: 480px) {
        font-size: 6.5px;
        padding: 5px 7px;
        border-radius: 7.6px;
        margin-bottom: -5px;
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
    margin: 35px auto;
    max-width: 26rem;
    line-height: 1.3;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        max-width: 13.8rem;
    }

    div {
        margin-top: 0px;

        @media (max-width: 480px) {
            font-size: 11px;
        }
    }
`;
