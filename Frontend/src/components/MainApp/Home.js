import React from "react";
import Sidebar from "./Sidebar";
import styled, { createGlobalStyle } from "styled-components";
import { Outlet } from "react-router-dom";

const Home = () => {
    return (
        <>
            <GlobalStyle />
            <HomeContainer>
                <Sidebar />
                <MainContent>
                    <Outlet />
                </MainContent>
            </HomeContainer>
        </>
    );
};

export default Home;

const GlobalStyle = createGlobalStyle`



    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body {
        height: 100%;
        width: 100%;
        background-color: #000;
    }
`;

const HomeContainer = styled.section`
    display: flex;
    width: 100%;
    height: 100vh;
    background: #080808;
    background-size: cover;
    color: #fff;
`;

const MainContent = styled.div`
    width: 100%;
    background: #000;
    color: #fff;
    overflow-y: auto;
    overflow-x: hidden;
`;
