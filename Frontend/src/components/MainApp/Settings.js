import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import Menu from "../../assets/Icons/paragraph.png";
import { useSidebar } from "../context/SidebarContext";

const Settings = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        profile_image: "",
    });
    const navigate = useNavigate();
    const { setShowSidebar } = useSidebar();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(
                    "https://coverence-backend.onrender.com/api/users/profile/",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setFormData(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const imageExists =
        formData.profile_image && !formData.profile_image.includes("drime.jpg");

    const handleEditClick = () => {
        navigate("/home/edit");
    };

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
                    <Heading>Settings</Heading>
                </div>
                <MenuButton onClick={() => setShowSidebar(true)}>
                    <img src={Menu} alt="menu" />
                </MenuButton>
            </SectionTitle>
            <Container>
                <ImageRow>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {imageExists ? (
                            <ProfilePreview
                                src={formData.profile_image}
                                alt="Profile"
                            />
                        ) : (
                            <ProfileImagePlaceholder />
                        )}

                        <div style={{ marginTop: "-10px" }}>
                            <FullName>
                                {formData.first_name} {formData.last_name}
                            </FullName>
                            <SkillName>{formData.skill_known}</SkillName>
                        </div>
                    </div>
                    <EditButton onClick={handleEditClick}>Edit</EditButton>
                </ImageRow>
            </Container>
        </>
    );
};

export default Settings;

const SectionTitle = styled.div`
    width: 100%;
    height: 5rem;
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

        @media (max-width: 480px) {
            width: 24px;
        }
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

const Container = styled.div`
    width: 100%;
    padding: 30px;
    border-radius: 12px;
`;

const ImageRow = styled.div`
    width: 72%;
    height: 6.2rem;
    background: #d5d5d5c4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 80px;
    margin-bottom: 55px;
    padding: 10px 19px;
    border-radius: 27px;
    margin-left: 5rem;

    @media (max-width: 480px) {
        width: 100%;
        height: 10%;
        margin: 4rem auto;
        border-radius: 22px;
    }
`;

const ProfilePreview = styled.img`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #343434;

    @media (max-width: 480px) {
        width: 50px;
        height: 50px;
    }
`;

const ProfileImagePlaceholder = styled.div`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    border: 3px solid #343434;
    background-color: rgb(112 112 112);

    @media (max-width: 480px) {
        width: 50px;
        height: 50px;
    }
`;

const FullName = styled.div`
    font-size: 30px;
    font-weight: bold;
    margin-left: 12px;
    font-family: "Outfit", sans-serif;
    color: #000;
    @media (max-width: 480px) {
        font-size: 16px;
    }
`;

const SkillName = styled.div`
    font-size: 15px;
    font-weight: 500;
    margin-left: 15px;
    font-family: "Outfit", sans-serif;
    color: #313131;
    @media (max-width: 480px) {
        font-size: 13px;
    }
`;

const EditButton = styled.button`
    display: inline-block;
    background-color: #242424;
    color: #dfdfdf;
    padding: 10px 25px;
    border-radius: 14px;
    border: 1px solid #242424;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    margin-right: 9px;
    font-family: "Figtree", sans-serif;
    outline: none;
    &:hover {
        opacity: 0.9;
    }

    @media (max-width: 480px) {
        font-size: 13px;
        padding: 5px 13px;
        border-radius: 11px;
    }
`;
