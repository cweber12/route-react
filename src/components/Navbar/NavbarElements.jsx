import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    
    background: black; 
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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

export const NavMenu = styled.div`
    display: flex;
    flex-direction: row;
    max-width: 100vw; 
    min-width: 100vw; 
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    background: rgba(30, 30, 30, 0.8);
    padding: 0 20px;
    
    @media screen and (max-width: 480px) {
        gap: 10px;
        padding: 0; 
        
    }   
`;

export const NavLink = styled(Link)`
    color: lightgray;
    background:rgba(39, 15, 15, 0.3); 
    width: 240px;
    font-size: 16px;
    font-weight: 520;
    padding: 6px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    margin: 0px;
    white-space: nowrap;
    transition: all 0.3s ease;
    border-radius: 4px;   

    
    &.active-link {
        background: linear-gradient(180deg, rgba(39, 15, 15, 0.3), rgba(39, 15, 15, 0.5));
        font-weight: 550;
        border: 1px solid #c6ff1d;

        @media screen and (max-width: 768px) {
            font-size: 14px;
        }

    }

    &:hover {
        color: #102E50;
        background: #c6ff1d;
    }

    @media screen and (max-width: 768px) {
        font-size: 14px;
        padding: 8px 14px;
        width: 40vw; 
        
    }

    @media screen and (max-width: 480px) {
        font-size: 14px;
        padding: 6px 12px;
        width: 40vw;
        
    }

    @media screen and (max-width: 360px) {
        font-size: 12px;
        padding: 5px 10px;
        width: 40vw;
    }
`;

export const UserIconContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 40px;
`;

export const LogoutButton = styled.button`
    color: black;
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 20px;
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

export const MenuIcon = styled.img`
  width: 40px;
  height: 40px;
  margin: 0 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    height: 44px;
    width: 44px;
  }
`;