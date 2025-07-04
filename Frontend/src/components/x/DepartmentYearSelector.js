import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const DepartmentYearSelectorCont = styled.div`
    align-self: center;
`;

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px;
`;

const SelectorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const WheelWrapper = styled.div`
    position: relative;
    width: 288px;
    height: 139px;
    overflow: hidden;
    border-radius: 20px 0px 0px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    overscroll-behavior: contain;
`;

const WheelWrapper2 = styled.div`
    position: relative;
    width: 100px;
    height: 139px;
    overflow: hidden;
    border-radius: 0px 20px 20px 0px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    overscroll-behavior: contain;
`;

const Wheel = styled.div`
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 40px 0;
    touch-action: pan-y;
    scroll-behavior: smooth;
    overscroll-behavior: contain;
    &::-webkit-scrollbar {
        width: 0;
    }
`;

const Option = styled.div`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${(props) => (props.selected ? "1.2rem" : "0.8rem")};
    color: ${(props) => (props.selected ? "#000" : "#ccc")};
    opacity: ${(props) => (props.selected ? 1 : 0.6)};
    scroll-snap-align: center;
`;

const DoneButton = styled.button`
    margin: 0px auto;
    padding: 7px 173px;
    font-size: 17px8;
    border-radius: 10px;
    cursor: pointer;
    display: block;
`;

const DepartmentYearSelector = () => {
    const departments = [
        "BCA",
        "BSc Computer Science",
        "BCom Computer Application",
        "BBA Travel and Tourism",
        "BA English",
    ];
    const years = Array.from({ length: 7 }, (_, i) => 2018 + i);
    const [selectedDepartment, setSelectedDepartment] = useState(
        departments[0]
    );
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const departmentWheelRef = useRef(null);
    const yearWheelRef = useRef(null);

    const handleScroll = (wheelRef, options, setSelectedOption) => {
        if (wheelRef.current) {
            const scrollPos = wheelRef.current.scrollTop;
            const itemHeight = 40;
            const selectedIdx = Math.round(scrollPos / itemHeight);
            setSelectedOption(options[selectedIdx]);
        }
    };

    useEffect(() => {
        const handleWheel = (wheelRef, options, selectedOption) => {
            const itemHeight = 40;
            const selectedIdx = options.indexOf(selectedOption);
            wheelRef.current.scrollTo({
                top: selectedIdx * itemHeight,
                behavior: "smooth",
            });
        };

        handleWheel(departmentWheelRef, departments, selectedDepartment);
        handleWheel(yearWheelRef, years, selectedYear);
    }, [selectedDepartment, selectedYear]);

    // Prevent bounce effect on iOS
    useEffect(() => {
        const handleTouchMove = (e) => e.preventDefault();
        const wheels = [departmentWheelRef.current, yearWheelRef.current];

        wheels.forEach((wheelElement) => {
            if (wheelElement) {
                wheelElement.addEventListener("touchmove", handleTouchMove, {
                    passive: false,
                });
                wheelElement.addEventListener("touchstart", handleTouchMove, {
                    passive: false,
                });
            }
        });

        return () => {
            wheels.forEach((wheelElement) => {
                if (wheelElement) {
                    wheelElement.removeEventListener(
                        "touchmove",
                        handleTouchMove
                    );
                    wheelElement.removeEventListener(
                        "touchstart",
                        handleTouchMove
                    );
                }
            });
        };
    }, []);

    // Disable body scroll when interacting with the selectors
    useEffect(() => {
        const disableBodyScroll = (e) => e.preventDefault();

        document.body.addEventListener("touchmove", disableBodyScroll, {
            passive: false,
        });

        return () => {
            document.body.removeEventListener("touchmove", disableBodyScroll);
        };
    }, []);

    return (
        <DepartmentYearSelectorCont>
            <h3 style={{ textAlign: "center", marginTop: 30 }}>
                Select Department & Year
            </h3>
            <Container>
                <SelectorWrapper>
                    <WheelWrapper>
                        <Wheel
                            ref={departmentWheelRef}
                            onScroll={() =>
                                handleScroll(
                                    departmentWheelRef,
                                    departments,
                                    setSelectedDepartment
                                )
                            }
                            aria-live="polite"
                        >
                            {departments.map((dept) => (
                                <Option
                                    key={dept}
                                    selected={dept === selectedDepartment}
                                >
                                    {dept}
                                </Option>
                            ))}
                        </Wheel>
                    </WheelWrapper>
                </SelectorWrapper>
                <SelectorWrapper>
                    <WheelWrapper2>
                        <Wheel
                            ref={yearWheelRef}
                            onScroll={() =>
                                handleScroll(
                                    yearWheelRef,
                                    years,
                                    setSelectedYear
                                )
                            }
                            aria-live="polite"
                        >
                            {years.map((year) => (
                                <Option
                                    key={year}
                                    selected={year === selectedYear}
                                >
                                    {year}
                                </Option>
                            ))}
                        </Wheel>
                    </WheelWrapper2>
                </SelectorWrapper>
            </Container>
            <DoneButton
                onClick={() =>
                    alert(
                        `Selected department: ${selectedDepartment}, Year: ${selectedYear}`
                    )
                }
            >
                Done
            </DoneButton>
        </DepartmentYearSelectorCont>
    );
};

export default DepartmentYearSelector;
