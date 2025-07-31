import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import ClearIcon from "../../assets/Icons/cross.png";
import SearchIcon from "../../assets/Icons/search.png";
import ArrowLeft from "../../assets/Icons/headarrowright.png";
import Menu from "../../assets/Icons/paragraph.png";
import { useSidebar } from "../context/SidebarContext";

const Search = () => {
    const [query, setQuery] = useState("");
    const [allResults, setAllResults] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("accounts");
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [visitedUsers, setVisitedUsers] = useState([]);
    const navigate = useNavigate();
    const { setShowSidebar } = useSidebar();

    useEffect(() => {
        let delaySearch;

        if (query.trim()) {
            setShowSkeleton(true);
            delaySearch = setTimeout(() => {
                handleSearch(query);
            }, 400);
        } else {
            setAllResults([]);
            setShowSkeleton(false);
        }

        return () => clearTimeout(delaySearch);
    }, [query]);

    const handleSearch = async (searchQuery) => {
        const token = localStorage.getItem("token"); //  token is stored with this exact key
        if (!token) {
            setError("Login required");
            setShowSkeleton(false);
            return;
        }

        try {
            const response = await axios.get(
                `https://coverence-backend.onrender.com/api/users/search/?q=${searchQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAllResults(response.data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to search users");
        } finally {
            setShowSkeleton(false);
        }
    };

    const handleClick = (user) => {
        const alreadyVisited = visitedUsers.some((u) => u.id === user.id);
        if (!alreadyVisited) {
            setVisitedUsers((prev) => [...prev, user]);
        }
        navigate(`/home/profile/${user.id}`, { state: { fromSearch: true } });
    };

    const getFilteredResults = () => {
        if (!query.trim()) return [];

        const searchQuery = query.toLowerCase().trim();

        return allResults.filter((user) => {
            const fullName =
                `${user.first_name} ${user.last_name}`.toLowerCase();
            const firstName = user.first_name?.toLowerCase() || "";
            const lastName = user.last_name?.toLowerCase() || "";
            const skillKnown = user.skill_known?.toLowerCase() || "";
            const skillWanted = user.skill_wanted?.toLowerCase() || "";

            if (activeTab === "accounts") {
                return (
                    fullName.includes(searchQuery) ||
                    firstName.includes(searchQuery) ||
                    lastName.includes(searchQuery)
                );
            } else if (activeTab === "skills") {
                return (
                    skillKnown.includes(searchQuery) ||
                    skillWanted.includes(searchQuery)
                );
            }

            return false;
        });
    };

    const filteredResults = getFilteredResults();

    const filteredVisited = visitedUsers.filter(
        (visited) => !filteredResults.some((result) => result.id === visited.id)
    );

    return (
        <FullContainer>
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
                    <Heading>Explore Profile's</Heading>
                </div>
                <MenuButton onClick={() => setShowSidebar(true)}>
                    <img src={Menu} alt="menu" />
                </MenuButton>
            </SectionTitle>
            <Container>
                <SearchBar>
                    <Input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query ? (
                        <Icon onClick={() => setQuery("")}>
                            <img src={ClearIcon} alt="clear" />
                        </Icon>
                    ) : (
                        <Icon2>
                            <img src={SearchIcon} alt="" />
                        </Icon2>
                    )}
                </SearchBar>

                <Tabs>
                    <Tab
                        active={activeTab === "accounts"}
                        onClick={() => setActiveTab("accounts")}
                    >
                        Accounts
                    </Tab>
                    <Tab
                        active={activeTab === "skills"}
                        onClick={() => setActiveTab("skills")}
                    >
                        Skills
                    </Tab>
                </Tabs>

                {error && <Error>{error}</Error>}

                <Results>
                    {showSkeleton ? (
                        [...Array(5)].map((_, index) => (
                            <SkeletonUserCard key={index}>
                                <SkeletonProfileImage />
                                <SkeletonUserInfo>
                                    <SkeletonLine width="60%" />
                                    <SkeletonLine width="20%" />
                                </SkeletonUserInfo>
                            </SkeletonUserCard>
                        ))
                    ) : filteredResults.length > 0 ? (
                        filteredResults.map((user) => (
                            <UserCard
                                key={user.id}
                                onClick={() => handleClick(user)}
                            >
                                <ProfileImage src={user.profile_image} />
                                <UserInfo>
                                    <h4>
                                        {user.first_name} {user.last_name}
                                    </h4>
                                    <p>{user.skill_known || "ㅤ"}</p>
                                </UserInfo>
                            </UserCard>
                        ))
                    ) : query ? (
                        <NoResults>No users found</NoResults>
                    ) : null}

                    {filteredVisited.length > 0 && (
                        <>
                            <VisitedTitle>Visited Profiles</VisitedTitle>
                            {filteredVisited.map((user) => (
                                <UserCard
                                    key={`visited-${user.id}`}
                                    onClick={() => handleClick(user)}
                                >
                                    <ProfileImage src={user.profile_image} />
                                    <UserInfo>
                                        <h4>
                                            {user.first_name} {user.last_name}
                                        </h4>
                                        <p>{user.skill_known || "ㅤ"}</p>
                                    </UserInfo>
                                </UserCard>
                            ))}
                        </>
                    )}
                </Results>
            </Container>
        </FullContainer>
    );
};

const shimmer = keyframes`
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
`;

const FullContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
`;

const Container = styled.div`
    width: 68%;
    height: 100%;
    margin-left: 8rem;
    margin-right: 10px;
    margin-top: 5.9rem;
    @media (max-width: 480px) {
        width: 100%;
        margin-top: 4.42rem;
        margin-left: 12px;
        padding-bottom: 1rem;
    }
`;

const SectionTitle = styled.div`
    width: 100%;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-items: center;
    position: fixed;
    background: #00000040;
    z-index: 9;
    backdrop-filter: blur(36px);
    padding: 48px 18px 45px 13px;

    @media (max-width: 480px) {
        height: 4rem;
        display: flex;
        justify-content: space-between;
        padding: 33px 13px 33px 13px;
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
        font-size: 27px;
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

const SearchBar = styled.div`
    width: 100%;
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    position: relative;

    @media (max-width: 480px) {
        margin-bottom: 13px;
    }
`;

const Input = styled.input`
    padding: 13px 32px;
    flex: 1;
    border-radius: 18px;
    outline: none;
    border: 1px solid #000000;
    background: rgb(55, 55, 55);
    font-weight: 600;
    color: #fff;
    font-size: 16px;

    &::placeholder {
        font-weight: 600;

        @media (max-width: 480px) {
            font-weight: 500;
        }
    }

    @media (max-width: 480px) {
        padding: 9px 20px;
        font-size: 16px;
    }
`;

const Icon2 = styled.span`
    width: 20px;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-48%);
    margin-right: 2px;

    font-size: 18px;
    color: #aaa;
    cursor: pointer;
    img {
        width: 100%;
        display: inline-block;
        filter: brightness(0) saturate(100%) invert(46%) sepia(0%) saturate(0%)
            hue-rotate(0deg) brightness(91%) contrast(87%);

        @media (max-width: 480px) {
            width: 86%;
        }
    }
`;

const Icon = styled.span`
    width: 15px;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-54%);
    margin-right: 2px;
    font-size: 18px;
    color: #aaa;
    cursor: pointer;
    img {
        width: 100%;
        display: inline-block;
        filter: brightness(0) saturate(100%) invert(46%) sepia(0%) saturate(0%)
            hue-rotate(0deg) brightness(91%) contrast(87%);
    }

    @media (max-width: 480px) {
        width: 13px;
    }
`;

const Tabs = styled.div`
    width: 99%;
    margin: auto;
    display: flex;
    gap: 12px;
    padding-bottom: 16px;
    margin-bottom: 20px;
    border-bottom: 1px solid #383838;
`;

const Tab = styled.div`
    padding: 7px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 14px;
    background-color: ${({ active }) => (active ? "#d8d8d8" : "#1d1d1d")};
    color: ${({ active }) => (active ? "black" : "white")};
    font-weight: 500;
    font-family: "Figtree", sans-serif;

    @media (max-width: 480px) {
        padding: 8px 13px;
        border-radius: 11px;
        font-size: 10px;
        font-weight: 600;
    }
`;

const Results = styled.div`
    width: 100%;
    height: 72%;
    overflow-y: auto;
    &::-webkit-scrollbar {
        width: 6px;

        @media (max-width: 480px) {
            width: 4px;
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
        height: 76%;
    }
`;

const UserCard = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 20px;
    border-radius: 20px;
    margin-bottom: 15px;
    cursor: pointer;
    &:hover {
        background-color: rgb(21, 21, 21);
    }

    @media (max-width: 480px) {
        padding: 12px 12px;
    }
`;

const ProfileImage = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #525252;
    background-image: ${({ src }) => (src ? `url(${src})` : "none")};
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    h4 {
        margin: 0;
    }
    p {
        margin: 2px 0 0;
        font-size: 0.9em;
        color: #666;
    }
`;

const SkeletonUserCard = styled(UserCard)`
    cursor: default;
    &:hover {
        background-color: transparent;
    }
`;

const SkeletonProfileImage = styled.div`
    width: 55px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(to right, #2a2a2a 8%, #3a3a3a 18%, #2a2a2a 33%);
    background-size: 800px 104px;
    animation: ${shimmer} 1.5s infinite linear;
`;

const SkeletonUserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`;

const SkeletonLine = styled.div`
    height: 12px;
    background: linear-gradient(to right, #2a2a2a 8%, #3a3a3a 18%, #2a2a2a 33%);
    background-size: 800px 104px;
    animation: ${shimmer} 1.5s infinite linear;
    border-radius: 4px;
    width: ${(props) => props.width || "100%"};
`;

const Error = styled.p`
    color: red;
    margin: 10px 0;
`;

const NoResults = styled.div`
    color: #888;
    text-align: center;
    padding: 20px;
    font-size: 16px;
`;

const VisitedTitle = styled.h3`
    margin-top: 30px;
    font-size: 18px;
    color: #ccc;
    border-top: 1px solid #444;
    padding-top: 10px;
`;

export default Search;
