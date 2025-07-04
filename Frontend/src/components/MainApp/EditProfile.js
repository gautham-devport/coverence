import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ArrowRight from "../../assets/Icons/headarrowright.png";
import heic2any from "heic2any";

const EditProfile = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        skill_known: "",
        skill_wanted: "",
        available_time: "",
        profile_image: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const [message, setMessage] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "https://coverence-backend.onrender.com/api/users/profile/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setFormData(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (
            file.type === "image/heic" ||
            file.name.toLowerCase().endsWith(".heic")
        ) {
            setIsConverting(true);
            try {
                const conversionResult = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8,
                });

                const convertedBlob = Array.isArray(conversionResult)
                    ? conversionResult[0]
                    : conversionResult;
                const convertedFile = new File(
                    [convertedBlob],
                    file.name.replace(/\.heic$/i, ".jpg"),
                    {
                        type: "image/jpeg",
                    }
                );

                setProfileImage(convertedFile);
                const previewUrl = URL.createObjectURL(convertedBlob);
                setFormData((prev) => ({ ...prev, profile_image: previewUrl }));
            } catch (error) {
                console.error("HEIC conversion failed", error);
                setMessage("Failed to process HEIC image");
            } finally {
                setIsConverting(false);
            }
        } else {
            setProfileImage(file);
            const previewUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, profile_image: previewUrl }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const data = new FormData();
        data.append("first_name", formData.first_name);
        data.append("last_name", formData.last_name);
        data.append("bio", formData.bio);
        data.append("skill_known", formData.skill_known);
        data.append("skill_wanted", formData.skill_wanted);
        data.append("available_time", formData.available_time);
        if (profileImage) {
            data.append("profile_image", profileImage);
        }

        try {
            await axios.put(
                "https://coverence-backend.onrender.com/api/users/profile/",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setMessage("Profile updated");
            setIsSaved(true);

            setTimeout(() => {
                window.location.reload();
            }, 100);
        } catch (error) {
            console.error("Update failed", error);
            setMessage("Failed to update profile.");
        }
    };

    const imageExists =
        formData.profile_image && !formData.profile_image.includes("drime.jpg");

    return (
        <>
            <SectionTitle>
                <BackButton onClick={() => navigate(-1)}>
                    <img src={ArrowRight} alt="Back" />
                </BackButton>
                <Heading>Edit Profile</Heading>
            </SectionTitle>
            <Container>
                <form onSubmit={handleSubmit}>
                    <ImageRow>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            {imageExists && (
                                <ProfilePreview
                                    src={formData.profile_image}
                                    alt="Profile"
                                />
                            )}
                            <div style={{ marginTop: "-10px" }}>
                                <FullName>
                                    {formData.first_name} {formData.last_name}
                                </FullName>
                                <SkillName>{formData.skill_known}</SkillName>
                            </div>
                        </div>

                        <UploadLabel htmlFor="profileImage">
                            {isConverting ? "Processing..." : "Change photo"}
                        </UploadLabel>
                    </ImageRow>

                    <FileInput
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isConverting}
                    />

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ width: "48%" }}>
                            <Title2>First Name</Title2>
                            <Input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="First Name"
                            />
                        </div>
                        <div style={{ width: "48%" }}>
                            <Title2>Last Name</Title2>
                            <Input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <Title2>Bio</Title2>
                    <Input2
                        type="text"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Write your Bio"
                    />

                    <Title2>Profession or Skill You Know</Title2>
                    <Input
                        type="text"
                        name="skill_known"
                        value={formData.skill_known}
                        onChange={handleChange}
                        placeholder="Type your known Skill"
                    />

                    <Title2>Skill You Wanted to Learn</Title2>
                    <Input
                        type="text"
                        name="skill_wanted"
                        value={formData.skill_wanted}
                        onChange={handleChange}
                        placeholder="Type skill you wanted"
                    />

                    <Title2>Available Time</Title2>
                    <Input
                        type="text"
                        name="available_time"
                        value={formData.available_time}
                        onChange={handleChange}
                        placeholder="eg: 7pm to 9pm"
                    />

                    <Button type="submit" disabled={isConverting}>
                        {isConverting
                            ? "Processing..."
                            : isSaved
                            ? "Saved"
                            : "Save Changes"}
                    </Button>
                </form>
                {message && <Message>{message}</Message>}
            </Container>
        </>
    );
};

export default EditProfile;

const Container = styled.div`
    width: 100%;
    height: 100vh;
    padding: 26px 68px;
    border-radius: 12px;
    margin: auto;
    font-family: "Karla", sans-serif;
    position: relative;
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

    form {
        width: 80.2%;
        margin: 0px auto;
        padding-left: 28px;

        @media (max-width: 768px) {
            width: 100%;
            padding: 0;
        }

        @media (max-width: 480px) {
            width: 96%;
            margin: 0px auto;
            padding-left: 9px;
        }
    }

    @media (max-width: 480px) {
        padding: 0;

        &::-webkit-scrollbar {
            width: 3px;
        }
    }
`;

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
        padding: 35px 13px 35px 13px;
    }
`;

const BackButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 6px;
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
    font-size: 33px;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        font-size: 28px;
    }
`;

const ImageRow = styled.div`
    height: 7rem;
    background: #d5d5d5c4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 80px;
    margin-bottom: 55px;
    padding: 10px 19px;
    border-radius: 27px;

    @media (max-width: 480px) {
        height: 5rem;
        margin-bottom: 30px;
        border-radius: 23px;
    }
`;

const ProfilePreview = styled.img`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #343434;

    @media (max-width: 480px) {
        width: 58px;
        height: 58px;
    }
`;

const FullName = styled.div`
    font-size: 30px;
    font-weight: bold;
    margin-left: 12px;
    font-family: "Outfit", sans-serif;
    color: #000;

    @media (max-width: 480px) {
        font-size: 17px;
    }
`;

const SkillName = styled.div`
    font-size: 16px;
    font-weight: 500;
    margin-left: 15px;
    font-family: "Outfit", sans-serif;
    color: #313131;

    @media (max-width: 480px) {
        font-size: 14px;
    }
`;

const UploadLabel = styled.label`
    display: inline-block;
    background-color: #2084e1;
    color: #dfdfdf;
    padding: 14px 16px;
    border-radius: 14px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    margin-right: 9px;
    font-family: "Outfit", sans-serif;
    &:hover {
        background-color: #2084e1;
    }

    @media (max-width: 480px) {
        font-size: 8px;
        padding: 7px 6px;
        border-radius: 9px;
    }
`;

const Title2 = styled.h2`
    margin-bottom: 16px;
    margin-left: 3px;
    font-weight: 400;
    font-size: 19px;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        font-size: 14px;
        margin-bottom: 8px;
    }
`;

const Input = styled.input`
    display: block;
    width: 100%;
    margin-bottom: 34px;
    padding: 14px 14px;
    font-size: 16px;
    border-radius: 15px;
    /* border: 1px solid #000000;
    background: #252525a8; */
    border: 1px solid #3d3d3d70;
    background: #272727a8;
    color: #d1d1d1;
    font-weight: 600;

    &::placeholder {
        color: rgb(88, 88, 88);
        font-size: 15px;
        font-weight: 400;
    }

    &:focus {
        outline: none;
    }

    @media (max-width: 480px) {
        padding: 11px 14px;
        font-size: 12px;
        border-radius: 13px;
    }
`;

const Input2 = styled.textarea`
    display: block;
    width: 100%;
    height: 8rem;
    margin-bottom: 30px;
    margin-top: -8px;
    padding: 14px 14px;
    font-size: 16px;
    border-radius: 24px;
    border: 1px solid #000000;
    background: #252525a8;
    color: #a1a1a1;
    font-weight: 500;
    resize: none;
    transition: border 0.3s ease;
    font-family: "Figtree", sans-serif;

    &::placeholder {
        color: rgb(88, 88, 88);
        font-size: 14px;
        font-weight: 400;
    }

    &:focus {
        border: 1px solid rgb(177, 177, 177);
        outline: none;
        box-shadow: 0 0 3px rgba(209, 209, 209, 0.5);
    }

    @media (max-width: 480px) {
        font-size: 14px;
        margin-top: 2px;
    }
`;

const FileInput = styled.input`
    display: none;
`;

const Button = styled.button`
    width: 100%;
    padding: 11px 2px;
    font-size: 18px;
    font-weight: 700;
    background-color: #565656;
    margin: 15px 0px 35px;
    color: #fff;
    border: none;
    border-radius: 18px;
    font-family: "Figtree", sans-serif;
    cursor: pointer;
    transition: 0.3s ease;

    &:hover {
        color: #000;
        background: #dbdbdb;
    }

    @media (max-width: 480px) {
        font-size: 12px;
    }
`;

const Message = styled.p`
    display: none;
`;
