import React from "react";
import styled from "styled-components";

const Suggestions = () => {
    return <SuggestionCard>Suggestions</SuggestionCard>;
};

export default Suggestions;

const SuggestionCard = styled.div`
    display: flex;
    flex-direction: column;
    width: 30%;
    height: 95%;
    background: #141414;
    border-radius: 25px;
    padding: 1.5rem;
    margin-top: auto;
`;
