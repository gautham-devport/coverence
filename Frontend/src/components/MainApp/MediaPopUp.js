import React, { useRef } from "react";
import styled, { keyframes } from "styled-components";
import PhotoIcon from "../../assets/Icons/photo.png";
import AudioIcon from "../../assets/Icons/audio-waves.png";

const MediaPopUp = ({ onClose }) => {
    const photoInputRef = useRef(null);
    const audioInputRef = useRef(null);

    const handlePhotoClick = () => {
        photoInputRef.current.click();
    };

    const handleAudioClick = () => {
        audioInputRef.current.click();
    };

    return (
        <>
            <ModalOverlay onClick={onClose}>
                <ModalContent>
                    <Option
                        onClick={handlePhotoClick}
                        style={{
                            borderRadius: "24px 24px 2px 2px",
                        }}
                    >
                        <img src={PhotoIcon} alt="Photos" />
                        <span>Photos</span>
                        <HiddenInput
                            type="file"
                            accept="image/*"
                            ref={photoInputRef}
                            onChange={(e) =>
                                console.log(
                                    "Photo selected:",
                                    e.target.files[0]
                                )
                            }
                        />
                    </Option>
                    <Option
                        onClick={handleAudioClick}
                        style={{
                            borderRadius: " 2px 2px 24px 24px",
                        }}
                    >
                        <img src={AudioIcon} alt="Audio" />
                        <span>Audio</span>
                        <HiddenInput
                            type="file"
                            accept="audio/*"
                            ref={audioInputRef}
                            onChange={(e) =>
                                console.log(
                                    "Audio selected:",
                                    e.target.files[0]
                                )
                            }
                        />
                    </Option>
                </ModalContent>
            </ModalOverlay>
        </>
    );
};

export default MediaPopUp;

const ModalOverlay = styled.div`
    position: fixed;
    z-index: 999;
`;

const popIn = keyframes`
  0% {
    transform: scale(0) translate(-10%, 80%);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
  }
`;

const ModalContent = styled.ul`
    width: 13rem;
    background-color: #40404094;
    border-radius: 24px;
    position: fixed;
    left: 17rem;
    bottom: 6rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    animation: ${popIn} 0.2s ease-out forwards;
    backdrop-filter: blur(20px);
    transform-origin: bottom left;

    @media (max-width: 900px) {
        left: 12rem;
    }

    @media (max-width: 480px) {
        width: 11rem;
        height: 5.5rem;
        left: 11px;
        bottom: 75px;
        justify-content: unset;
    }
`;

const Option = styled.li`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 26px;
    cursor: pointer;
    border-bottom: 0.8px solid #6f6f6f;
    transition: all 0.2s ease;
    &:last-child {
        border: none;
        @media (max-width: 480px) {
            margin-top: -4px;
        }
    }
    &:hover {
        background-color: #87878717;

        @media (max-width: 480px) {
            background-color: unset;
        }
    }

    img {
        width: 26px;
        height: 26px;
        border-radius: 8px;
    }

    span {
        color: rgb(220, 220, 220);
        font-size: 20px;
        font-weight: 700;
        font-family: "Figtree", sans-serif;
    }

    @media (max-width: 480px) {
        transform: scale(0.82);
        padding: 10px 18px;
    }
`;

const HiddenInput = styled.input`
    display: none;
`;
