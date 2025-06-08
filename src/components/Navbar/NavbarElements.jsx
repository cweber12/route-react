import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: url("/assets/4020330.jpg");
    font-family: 'Courier New', Courier, monospace;
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0;
    margin-bottom: 20px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;
    z-index: 1000;
    box-sizing: border-box;

    
`;

export const NavTop = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    width: 100%;
    height: 40%;
`;

export const NavBottom = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    height: 60%;
    gap: 20px; 
`;

export const NavMenu = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%; 
    align-items: center;

    gap: 80px;
    background: rgba(30, 30, 30, 0.8);
    padding-left: 40px; 
    justify-content: center;


    @media screen and (max-width: 480px) {
        gap: 10px;
        padding: 0; 
        justify-content: center;
        
    }

    
`;

export const NavLink = styled(Link)`
    color: lightgray;
    background:rgb(32, 45, 63); 
    width: 200px;
    font-size: 20px;
    font-weight: 550;
    padding: 10px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    margin: 0px;
    white-space: nowrap;
    transition: all 0.3s ease;
    border-radius: 4px;   
    border-left: 4px solid rgb(228, 255, 146);
    border-right: 4px solid #e4ff92;
    &.active-link {
        background: rgb(228, 255, 146);
    }

    &:hover {
        color: #102E50;
        background: rgb(228, 255, 146);
    }

    @media screen and (max-width: 768px) {
        font-size: 16px;
        padding: 8px 14px;
        width: 100px; 
        
    }

    @media screen and (max-width: 480px) {
        font-size: 14px;
        padding: 6px 12px;
        width: 40%
        
    }

    @media screen and (max-width: 360px) {
        font-size: 12px;
        padding: 5px 10px;
        width: 40px;
    }
`;

export const UserIconContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const LogoutButton = styled.button`
    color: black;
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 20px;
    font-family: courier, sans-serif;
    font-weight: 500;
    border-radius: 4px;
    transition: background-color 0.2s ease, transform 0.1s ease-in-out;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    
    &:active {
        transform: scale(0.98);
    }

    @media screen and (max-width: 768px) {
        font-size: 16px;
    }

    @media screen and (max-width: 480px) {
        font-size: 14px;
    }
`;
