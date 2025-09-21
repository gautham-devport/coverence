import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import styled from "styled-components";
import bgImage from "../assets/images/blurry-bg.png";
import visibleEye from "../assets/images/view.png";
import hiddenEye from "../assets/images/hidden.png";
import Padloack from "../assets/images/padlock.png";
import Mail from "../assets/images/mail.png";

const SignUp = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Spinner state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        email: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === "email") {
            validateEmail(e.target.value);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email === "") {
            setErrors({ ...errors, email: "" });
        } else if (/[A-Z]/.test(email)) {
            setErrors({
                ...errors,
                email: "Email must not contain capital letters.",
            });
        } else if (!emailRegex.test(email)) {
            setErrors({
                ...errors,
                email: "Please enter a valid email address.",
            });
        } else {
            setErrors({ ...errors, email: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Show spinner
        validateEmail(formData.email);

        const emailHasCaps = /[A-Z]/.test(formData.email);
        if (emailHasCaps) {
            setErrors({
                ...errors,
                email: "Email must not contain capital letters.",
            });
            setIsLoading(false);
            return;
        }

        if (!errors.email && formData.email) {
            try {
                const response = await axios.post(
                    "https://coverence-backend.onrender.com/api/users/signup/",
                    {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                    }
                );

                const user = response.data;

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                    })
                );

                navigate("/login");
            } catch (error) {
                console.error(error.response?.data);
                if (error.response?.data?.email) {
                    setErrors({
                        ...errors,
                        email: "Signup failed. Please try again.",
                    });
                } else {
                    setErrors({
                        ...errors,
                        email: "Email already exists. Please use a different one.",
                    });
                }
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <FullContainer>
            <FormContainer onSubmit={handleSubmit} noValidate>
                <FormName>Sign Up</FormName>
                <FormGroup>
                    <Label>First Name</Label>
                    <Input
                        type="text"
                        name="firstName"
                        placeholder="Enter your first name"
                        autoComplete="new-first-name"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Last Name</Label>
                    <Input
                        type="text"
                        name="lastName"
                        placeholder="Enter your last name"
                        autoComplete="new-last-name"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Em@il</Label>
                    <MailImg src={Mail} alt="mail" />
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        autoComplete="new-email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                </FormGroup>
                <FormGroup>
                    <Label>Password</Label>
                    <PadloackImg src={Padloack} alt="lock" />
                    <PasswordContainer>
                        <DupiInput>
                            <Input4
                                placeholder="Enter password"
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <ViewImage
                                src={passwordVisible ? visibleEye : hiddenEye}
                                alt="Toggle visibility"
                                onClick={togglePasswordVisibility}
                            />
                        </DupiInput>
                    </PasswordContainer>
                </FormGroup>
                <SignUpButton type="submit" disabled={isLoading}>
                    Sign Up
                    {isLoading && <Spinner />}
                </SignUpButton>
                <LoginInfo>
                    Already have an account?
                    <LoginRedirect to="/login">Login</LoginRedirect>
                </LoginInfo>
            </FormContainer>
        </FullContainer>
    );
};

export default SignUp;

const FullContainer = styled.section`
    width: 100%;
    height: 100vh;
    background: url(${bgImage}) no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width: 480px) {
        background: #000;
    }
`;

const FormContainer = styled.form`
    width: 32.5%;
    height: 81%;
    background-color: hsl(208.31deg 12.59% 23.45% / 57%);
    backdrop-filter: blur(4px);
    border-radius: 30px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2), 0px 6px 20px rgba(0, 0, 0, 0.19);
    padding: 15px 25px 25px;

    @media (max-width: 768px) {
        width: 60%;
        height: 80%;
        transform: scale(0.9);
    }

    @media (max-width: 480px) {
        width: 100%;
        height: 100%;
        transform: scale(1);
        border-radius: 0px;
        box-shadow: unset;
        background-color: hsl(208.31deg 12.59% 23.45% / 0%);
    }
`;

const FormName = styled.h2`
    font-size: 30px;
    text-align: center;
    font-weight: 700;
    margin-bottom: 8px;

    @media (max-width: 480px) {
        font-size: 32px;
        margin: 2rem 0rem 1.8rem 0rem;
        color: #fff;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 15px;

    @media (max-width: 480px) {
        margin-bottom: 14px;
    }
`;
const Label = styled.label`
    display: inline-block;
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
    margin-left: 2px;

    @media (max-width: 480px) {
        color: #e9e9e9;
        font-size: 16px;
        font-family: "Figtree", sans-serif;
        font-weight: 600;
    }
`;
const MailImg = styled.img`
    width: 17px;
    height: 17px;
    margin-left: 6px;
    margin-bottom: -3px;

    @media (max-width: 480px) {
        width: 14px;
        height: 14px;
        margin-left: 4px;
        filter: invert(74%);
        display: none;
    }
`;
const PadloackImg = styled.img`
    width: 13px;
    height: 13px;
    margin-left: 6px;

    @media (max-width: 480px) {
        width: 10px;
        height: 10px;
        margin-left: 4px;
        filter: invert(45%);
    }
`;
const Input = styled.input`
    width: 100%;
    height: 43px;
    padding: 22px 18px;
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 12px;
    background-color: hsl(193.54deg 12.52% 80.07% / 46%);
    outline: none;
    border: 1px solid #36393926;

    @media (max-width: 480px) {
        height: 38px;
        font-size: 16px;
        padding: 13px 18px;

        &::placeholder {
            color: #888888d1;
            font-weight: 400;
        }
    }
`;
const DupiInput = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 43px;
    border-radius: 12px;
    background-color: hsl(193.54deg 12.52% 80.07% / 46%);
    outline: none;
    border: 1px solid #36393926;
    @media (max-width: 480px) {
        height: 38px;
    }
`;
const Input4 = styled.input`
    width: 85%;
    height: 100%;
    padding: 0px 18px;
    font-size: 17px;
    font-weight: 500;
    border-radius: 12px;
    background-color: hsl(193.54deg 63.2% 41.37% / 0%);
    outline: none;
    border: none;

    @media (max-width: 480px) {
        height: 38px;
        font-size: 16px;
        padding: 13px 18px;

        &::placeholder {
            font-weight: 400;
            color: #888888d1;
        }
    }
`;
const PasswordContainer = styled.div``;

const ViewImage = styled.img`
    width: 18px;
    height: 20px;
    margin-left: 20px;

    @media (max-width: 480px) {
        width: 14px;
        height: 16px;
    }
`;
const SignUpButton = styled.button`
    width: 100%;
    padding: 13px;
    font-size: 17px;
    color: #fff;
    background-color: #111112e3;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    margin-top: 22px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #242425fa;

        @media (max-width: 480px) {
            background-color: #0b8efad2;
        }
    }

    @media (max-width: 480px) {
        background-color: #1197ffe3;
        font-size: 15px;
        padding: 10px;
        border-radius: 12px;
        margin-top: 24px;
    }
`;
const ErrorText = styled.p`
    color: #ff1212;
    font-size: 14px;
    margin-top: 4px;
    margin-left: 5px;
    @media (max-width: 480px) {
        font-size: 11px;
        margin-top: 2px;
    }
`;
const LoginInfo = styled.h5`
    margin-top: 16px;
    font-size: 16px;
    text-align: center;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        margin-top: 16px;
        font-size: 15px;
        color: #7e7e7e;
    }
`;
const LoginRedirect = styled(Link)`
    color: #1d6ff3;
    margin-left: 8px;
    font-family: "Figtree", sans-serif;

    &:hover {
        border-bottom: 2px solid #1d6ff3;
        cursor: pointer;
    }
`;

const Spinner = styled.div`
    margin-left: 12px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: white;
    border-right-color: white;
    border-bottom-color: white;

    animation: spin 0.8s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;
