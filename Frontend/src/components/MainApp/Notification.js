import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    formatDistanceToNow,
    isToday,
    isYesterday,
    differenceInDays,
} from "date-fns";
import styled from "styled-components";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import Menu from "../../assets/Icons/paragraph.png";
import { useSidebar } from "../context/SidebarContext";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { setShowSidebar } = useSidebar();
    const isMobile = window.innerWidth <= 480;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) {
                setError("You must be logged in.");
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(
                    "https://coverence-backend.onrender.com/api/users/notifications/",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setNotifications(res.data);
            } catch (err) {
                setError("Failed to fetch notifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    const handleFollow = async (userId, index) => {
        try {
            await axios.post(
                `https://coverence-backend.onrender.com/api/users/${userId}/follow/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const updated = [...notifications];
            updated[index].is_following_back = true;
            setNotifications(updated);
        } catch (err) {
            console.error("Follow action failed", err);
        }
    };

    if (loading) return null;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    const categorized = {
        Today: [],
        Yesterday: [],
        "Last 7 Days": [],
    };

    notifications.forEach((notif, index) => {
        const notifDate = new Date(notif.created_at);
        if (isToday(notifDate)) {
            categorized.Today.push({ ...notif, index });
        } else if (isYesterday(notifDate)) {
            categorized.Yesterday.push({ ...notif, index });
        } else if (differenceInDays(new Date(), notifDate) <= 7) {
            categorized["Last 7 Days"].push({ ...notif, index });
        }
    });

    const renderNotifications = (title, list) =>
        list.length > 0 && (
            <>
                <CategoryTitle>{title}</CategoryTitle>
                {list.map((notif) => {
                    const user = notif.from_user;
                    const isFollowNotification =
                        notif.notification_type === "follow";

                    return (
                        <NotificationItem key={notif.id}>
                            <StyledLink to={`/home/profile/${user.id}`}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {user.profile_image ? (
                                        <ProfileImage
                                            src={user.profile_image}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <PlaceholderImage>
                                            {(user.first_name?.[0] || "") +
                                                (user.last_name?.[0] || "")}
                                        </PlaceholderImage>
                                    )}
                                    <div style={{ marginLeft: "12px" }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: isMobile
                                                    ? "10px"
                                                    : "24px",

                                                display: isMobile
                                                    ? "none"
                                                    : "inline-block",
                                            }}
                                        >
                                            <strong>
                                                {user.first_name}{" "}
                                                {user.last_name}
                                            </strong>
                                        </p>
                                        {user.skill_known && (
                                            <SkillText>
                                                {user.skill_known}
                                            </SkillText>
                                        )}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: isMobile
                                            ? "column"
                                            : "row",
                                        fontSize: isMobile ? "15px" : "17px",
                                        fontFamily: "Figtree",
                                    }}
                                >
                                    <UserName>
                                        {user.first_name} {user.last_name}
                                    </UserName>
                                    {isFollowNotification && (
                                        <Message>started following you</Message>
                                    )}
                                    <TimeText>
                                        {formatDistanceToNow(
                                            new Date(notif.created_at),
                                            { addSuffix: true }
                                        )}
                                    </TimeText>
                                </div>
                            </StyledLink>

                            <div
                                style={{ marginLeft: isMobile ? "0" : "5rem" }}
                            >
                                {isFollowNotification &&
                                    (notif.is_following_back ? (
                                        <FollowingButton disabled>
                                            Following
                                        </FollowingButton>
                                    ) : (
                                        <FollowButton
                                            onClick={() =>
                                                handleFollow(
                                                    user.id,
                                                    notif.index
                                                )
                                            }
                                        >
                                            Follow Back
                                        </FollowButton>
                                    ))}
                            </div>
                        </NotificationItem>
                    );
                })}
            </>
        );

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
                    <Heading>Notifications</Heading>
                </div>
                <MenuButton onClick={() => setShowSidebar(true)}>
                    <img src={Menu} alt="menu" />
                </MenuButton>
            </SectionTitle>

            <Container>
                <NotificationList>
                    {renderNotifications("Today", categorized.Today)}
                    {renderNotifications("Yesterday", categorized.Yesterday)}
                    {renderNotifications(
                        "Last 7 Days",
                        categorized["Last 7 Days"]
                    )}
                </NotificationList>
            </Container>
        </>
    );
};

export default Notification;

const Container = styled.div`
    width: 68%;
    margin: 0 auto;
    @media (max-width: 480px) {
        width: 90%;
    }
`;

const NotificationList = styled.ul`
    list-style: none;
    padding: 0;
    margin-top: 7rem;
    margin-bottom: 5rem;
    @media (max-width: 480px) {
        margin-top: 5rem;
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
            width: 35px;
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
        font-size: 28px;
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
            width: 23px;
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
const CategoryTitle = styled.h3`
    color: #ccc;
    font-size: 22px;
    margin: 2rem 0 1rem 0;
    font-family: "Figtree", sans-serif;
    font-weight: 800;
    @media (max-width: 480px) {
        font-size: 18px;
    }
`;

const NotificationItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.6rem;
    background: #1b1b1b;
    border-radius: 22px;
    margin-bottom: 20px;

    @media (max-width: 480px) {
        width: 100%;
        padding: 14px 10px;
        border-radius: 19px;
        transform: scale(1.03);
    }
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;

    @media (max-width: 480px) {
        justify-content: flex-start;
    }
`;

const ProfileImage = styled.img`
    width: 62px;
    height: 62px;
    border-radius: 50%;
    margin-right: 0.5rem;
    object-fit: cover;
    @media (max-width: 480px) {
        width: 44px;
        height: 44px;
        margin-right: -3px;
        margin-left: 6px;
        border: 1px solid #545454;
    }
`;

const PlaceholderImage = styled.div`
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background-color: #525252;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    font-weight: bold;
    text-transform: uppercase;

    @media (max-width: 480px) {
        width: 44px;
        height: 44px;
        margin-right: -3px;
        margin-left: 6px;
        border: 1px solid #545454;
    }
`;

const SkillText = styled.p`
    margin: 0;
    color: #8c8c8c;
    font-size: 16px;
    @media (max-width: 480px) {
        display: none;
    }
`;

const UserName = styled.small`
    display: none;
    @media (max-width: 480px) {
        display: inline-block;
        color: #d6d6d6;
        font-weight: 700;
        font-size: 13.5px;
    }
`;
const Message = styled.small`
    font-size: 15px;

    @media (max-width: 480px) {
        font-size: 13px;
        color: #c9c9c9;
    }
`;
const TimeText = styled.small`
    color: #999;
    margin-left: 12px;

    @media (max-width: 480px) {
        font-size: 10.6px;
        margin-left: 0;
        color: #5d5d5d;
    }
`;

const FollowButton = styled.button`
    background-color: #0092ff;
    color: white;
    border: none;
    padding: 7.1px 10.8px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 600;
    margin-right: 5px;
    transition: background 0.2s;

    &:hover {
        background-color: rgba(0, 145, 255, 0.91);
    }

    @media (max-width: 480px) {
        font-size: 8px;
        padding: 6.6px 13.8px;
    }
`;

const FollowingButton = styled.button`
    background-color: #555555;
    color: white;
    border: none;
    padding: 6px 13.8px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: default;
    margin-right: 5px;

    @media (max-width: 480px) {
        font-size: 8px;
        padding: 6.6px 17.8px;
    }
`;
