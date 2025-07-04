import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import styled from "styled-components";

const SlotMachineContainer = styled.div`
    position: relative;
    width: 200px;
    height: 80px;
    overflow: hidden;
    border: 1px solid #ccc;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SlotList = styled(animated.div)`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const SlotItem = styled.div`
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${(props) => (props.isCenter ? "24px" : "18px")};
    color: ${(props) => (props.isCenter ? "black" : "#aaa")};
    box-shadow: ${(props) =>
        props.isCenter ? "0px 0px 10px rgba(0,0,0,0.2)" : "none"};
`;

const Button = styled.button`
    margin: 10px;
`;

const SlotMachine = ({ years, onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [show, setShow] = useState(false);

    const handleScroll = (direction) => {
        setCurrentIndex((prevIndex) => {
            const newIndex =
                (prevIndex + direction + years.length) % years.length;
            return newIndex;
        });
    };

    const handleDone = () => {
        onSelect(years[currentIndex]);
        setShow(false);
    };

    const { transform } = useSpring({
        transform: `translateY(${-currentIndex * 40}px)`,
        config: { tension: 300, friction: 20 },
    });

    return (
        <div>
            <Button onClick={() => setShow(!show)}>Select Year</Button>
            {show && (
                <SlotMachineContainer>
                    <SlotList style={{ transform }}>
                        {years.map((year, index) => (
                            <SlotItem
                                key={index}
                                isCenter={index === currentIndex % years.length}
                            >
                                {year}
                            </SlotItem>
                        ))}
                    </SlotList>
                    <Button onClick={() => handleScroll(-1)}>Scroll Up</Button>
                    <Button onClick={() => handleScroll(1)}>Scroll Down</Button>
                </SlotMachineContainer>
            )}
            {show && <Button onClick={handleDone}>Done</Button>}
        </div>
    );
};

export default SlotMachine;
