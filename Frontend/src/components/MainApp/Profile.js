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
                        <EditButton onClick={handleEditProfile}>
                            Edit
                        </EditButton>
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
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    lineHeight: "2.2",
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
                                            I like <p>{user.skill_wanted}</p>
                                        </span>
                                    )}
                                </Field2>
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
    width: 61%;
    margin: auto;
    padding: 3.6rem 9rem;
    color: white;

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
        padding: 110px 20px 2px 20px;
        justify-content: center;
        transform: scale(1.45);
        margin-right: 0;
    }
`;

const ProfileImage = styled.img`
    width: 400px;
    height: 362px;
    border-radius: 24px;
    object-fit: cover;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
        width: 168px;
        height: 167px;
        margin-right: 5px;
        margin-bottom: 10px;
        border-radius: 20px;
    }
`;

const ProfileImagePlaceholder = styled.div`
    width: 400px;
    height: 362px;
    border-radius: 24px;
    background-color: #525252;
    margin-bottom: 1rem;

    @media (max-width: 480px) {
        width: 168px;
        height: 167px;
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
        margin-bottom: -13px;
    }
`;

const Field2 = styled.p`
    span {
        font-size: 14px;
        margin-right: 13px;
        margin-left: -2px;
        padding: 0.3rem 0.8rem;
        background: #858585;
        text-align: center;
        border-radius: 16px;
        font-weight: 500;
        color: #000;
        p {
            display: inline-block;
            font-weight: 600;
        }

        @media (max-width: 480px) {
            font-size: 8.3px;
            padding: 2px 6px;
            margin-right: 6px;
            border-radius: 10px;
        }
    }
`;

const EditButton = styled.button`
    position: relative;
    left: 10.5rem;
    top: 31px;
    display: inline-block;
    padding: 2px 10px;
    color: #000;
    border-radius: 16px;
    background-color: #ffffff52;
    backdrop-filter: blur(5px);
    cursor: default;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid #ffffff38;
    font-family: "Figtree", sans-serif;
    transition: 0.3s ease;

    &:hover {
        background-color: #ffffffb4;
    }
    @media (max-width: 480px) {
        top: 15px;
        left: 3.8rem;
        font-size: 6.6px;
        padding: 2px 7px;
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
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color: #b9b9b9;
    margin: 22px auto;
    max-width: 27rem;
    line-height: 1.3;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        margin: 8px auto;
    }

    div {
        margin-top: 0px;

        @media (max-width: 480px) {
            font-size: 10px;
        }
    }
`;
