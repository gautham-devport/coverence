import React, { useEffect, useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import Menu from "../../assets/Icons/paragraph.png";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import SearchIcon from "../../assets/Icons/search.png";
import messageicon from "../../assets/Icons/chat-bubble.png";
import { useSidebar } from "../context/SidebarContext";

const HomePage = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        profile_image: "",
    });
    const navigate = useNavigate();
    const { setShowSidebar } = useSidebar();
    const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);

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

    useEffect(() => {
        const fetchUnseenMessages = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(
                    "https://coverence-backend.onrender.com/api/chat/recent/",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUnseenMessagesCount(res.data.total_unseen_messages || 0);
            } catch (err) {
                console.error("Error fetching unseen messages", err);
            }
        };

        fetchUnseenMessages();
    }, []);

    const imageExists =
        formData.profile_image && !formData.profile_image.includes("drime.jpg");

    const handleSearch = () => {
        navigate("/home/search");
    };

    const handleProfileClick = () => {
        navigate("/home/profile");
    };

    const handleMessgaesClick = () => {
        navigate("/home/message");
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

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <SearchButton onClick={handleSearch}>
                        <img src={SearchIcon} alt="Back" />
                    </SearchButton>

                    {imageExists ? (
                        <ProfileImage
                            onClick={handleProfileClick}
                            src={formData.profile_image}
                            alt="Profile"
                        />
                    ) : (
                        <ProfileImagePlaceholder onClick={handleProfileClick} />
                    )}
                </div>
            </SectionTitle2>

            <Content>
                <WelcomTitle>
                    Hey,{" "}
                    <b>
                        {formData.first_name} {formData.last_name}
                    </b>
                </WelcomTitle>
                <HomeCard>
                    <MainTitle>Coverence</MainTitle>
                    <Sub>Discover. Connect. Chat.</Sub>
                    <span>
                        Coverence is a social platform where users can
                        seamlessly interact and build meaningful connections.
                    </span>
                    <Features>
                        <li>
                            <h4>Explore profiles</h4>
                        </li>
                        <li>
                            <h4>Chat instantly</h4>
                        </li>
                    </Features>
                    <EndContent>
                        Whether you're discovering new Person or staying in
                        touch with friends,
                        <b>
                            Coverence brings profiles and conversations together
                            seamlessly.
                        </b>
                    </EndContent>
                </HomeCard>

                <Messages onClick={handleMessgaesClick}>
                    <MessageIcon>
                        <img src={messageicon} alt="" />
                    </MessageIcon>
                    {unseenMessagesCount > 0 && (
                        <UnseenCount>{unseenMessagesCount}</UnseenCount>
                    )}
                    <h5>Messages</h5>
                </Messages>
            </Content>
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
    backdrop-filter: blur(85px);
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
        height: 4.4rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        background: #0505057d;
        z-index: 9;
        backdrop-filter: blur(28px);
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
        font-size: 26px;
        font-weight: 800;
    }
`;

const SearchButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 23px;
    img {
        width: 21px;
        height: 22px;
        filter: invert(1);
        margin-top: 2px;
    }
`;

const ProfileImage = styled.img`
    width: 32px;
    height: 32px;
    display: inline-block;
    object-fit: cover;
    border-radius: 50%;

    @media (max-width: 480px) {
        width: 32px;
        height: 32px;
        margin-top: -1px;
    }
`;

const ProfileImagePlaceholder = styled.div`
    width: 33px;
    height: 33px;
    border-radius: 50%;
    background-color: #525252;
`;

const Content = styled.div`
    height: 100vh;
    padding: 6rem 4.3rem 4rem;
    overflow-y: scroll;

    &::-webkit-scrollbar {
        width: 7px;
        @media (max-width: 480px) {
            width: 3.5px;
        }
    }

    &::-webkit-scrollbar-thumb {
        background-color: #8b8b8b;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    @media (max-width: 480px) {
        height: 100dvh;
        -webkit-overflow-scrolling: touch;
        padding: 5rem 1rem 2rem;
    }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    
  }
  to {
    opacity: 1;
    
  }
`;

const WelcomTitle = styled.h2`
    display: none;

    b {
        color: #fff;
        font-weight: 700;
    }

    @media (max-width: 480px) {
        display: block;
        font-size: 21px;
        font-weight: 500;
        margin-left: 15px;
        margin-top: 2px;
        margin-bottom: 23px;
        font-family: "Figtree", sans-serif;
        animation: ${fadeIn} 2.4s ease-out forwards;
    }
`;

const HomeCard = styled.div`
    width: 80%;
    padding: 36px;
    background: linear-gradient(135deg, #b388eb, #2a1f42);
    border-radius: 0px;
    margin: 0 auto;
    margin-top: 10px;
    margin-bottom: 3.2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
        0 1px 2px rgba(255, 255, 255, 0.05);

    span {
        font-size: 29px;
        font-weight: 600;
        margin-bottom: 25px;
        display: block;

        @media (max-width: 480px) {
            font-size: 26px;
            margin-bottom: 18px;
        }
    }

    @media (max-width: 480px) {
        width: 100%;
        padding: 27px 30px;
    }
`;

const MainTitle = styled.h2`
    font-size: 38px;
    text-align: center;
    font-weight: 700;
    font-family: "Figtree", sans-serif;
`;

const Sub = styled.h3`
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    color: #008fff;
    margin-top: 8px;
    margin-left: 12px;
    margin-bottom: 40px;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        font-size: 19px;
        margin-bottom: 24px;
    }
`;

const Features = styled.ul`
    li {
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        color: #008fff;
        background: #0404048f;
        padding: 14px 17px;
        border-radius: 2px;
        margin-bottom: 15px;
        font-family: "Figtree", sans-serif;

        @media (max-width: 480px) {
            font-size: 16.5px;
            margin-bottom: 13px;
            padding: 11px 17px;
            border-radius: 10px;
        }
    }
`;

const EndContent = styled.p`
    font-size: 19px;
    color: #858585;
    font-weight: 600;
    line-height: 1.4;
    font-family: "Figtree", sans-serif;
    margin-top: 17px;
    margin-bottom: 48px;
    padding: 0px 22px;

    @media (max-width: 480px) {
        font-size: 17.4px;
        padding: 0px 5px;
        margin-bottom: 10px;
    }

    b {
        color: #fff;
        margin-top: 22px;
        margin-left: 3px;
        font-weight: 500;
        color: #cecece;
    }
`;

const Messages = styled.button`
    display: none;

    @media (max-width: 480px) {
        outline: none;
        border: none;
        position: fixed;
        bottom: 1.4rem;
        left: 50%;
        transform: translateX(-50%);
        padding: 11.2px 25px;
        background: #e3e3e363;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(6px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 24px;
        gap: 12px;
        border: 1px solid #99999957;

        &:hover {
            background: #a8a8a8ff;
        }

        h5 {
            color: #000;
            font-size: 18.8px;
            font-family: "Figtree", sans-serif;
        }
    }
`;

const MessageIcon = styled.div`
    img {
        width: 22px;
        height: 22px;
        margin-bottom: -6px;
        font-weight: 500;
    }
`;
const UnseenCount = styled.div`
    min-width: 16px;
    height: 16px;
    position: absolute;
    left: 37px;
    top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 9.6px;
    font-weight: 600;
    border-radius: 999px;
    padding: 2px 6px;
    background-color: #ff3b30;
`;
