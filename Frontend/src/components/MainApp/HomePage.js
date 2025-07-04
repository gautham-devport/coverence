import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Menu from "../../assets/Icons/paragraph.png";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import { useSidebar } from "../context/SidebarContext";

const HomePage = () => {
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
                    "http://127.0.0.1:8000/api/users/profile/",
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
        navigate("/home/profile");
    };

    return (
        <>
            <SectionTitle>
                <BackButton onClick={() => navigate(-1)}>
                    <img src={ArrowLeft} alt="Back" />
                </BackButton>
                <Heading>Home</Heading>
            </SectionTitle>

            <SectionTitle2>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <MenuButton onClick={() => setShowSidebar(true)}>
                        <img src={Menu} alt="menu" />
                    </MenuButton>
                    <Heading2>Home</Heading2>
                </div>
                {imageExists && (
                    <ProfileImage
                        onClick={handleEditClick}
                        src={formData.profile_image}
                        alt="Profile"
                    />
                )}
            </SectionTitle2>
        </>
    );
};

export default HomePage;

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
        display: none;
    }
`;

const BackButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 10px;

    img {
        width: 47px;
        transform: rotate(180deg);
        filter: invert(28%) sepia(98%) saturate(1200%) hue-rotate(180deg)
            brightness(110%) contrast(95%);
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
`;

// 480
const SectionTitle2 = styled.div`
    display: none;
    @media (max-width: 480px) {
        width: 100%;
        height: 5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        background: #0a0a0a;
        z-index: 9;
        backdrop-filter: blur(36px);
        padding: 35px 20px 35px 20px;
    }
`;

const MenuButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 15px;

    img {
        margin-top: 3px;
        width: 23px;
        filter: invert(28%) sepia(98%) saturate(1200%) hue-rotate(180deg)
            brightness(110%) contrast(95%);
    }
    &:hover {
        opacity: 0.9;
    }
`;

const Heading2 = styled.h2`
    display: inline-block;
    font-weight: 700;
    font-size: 30px;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        font-size: 25px;
    }
`;

const ProfileImage = styled.img`
    width: 32px;
    height: 32px;
    display: inline-block;
    border-radius: 50%;

    @media (max-width: 480px) {
        width: 30px;
        height: 30px;
        margin-top: -1px;
    }
`;
