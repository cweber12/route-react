import React from "react";
import RegistrationForm from "../components/RegistrationForm";
import LoginForm from "../components/LoginForm";
import { useNavigate } from 'react-router-dom'; 
import "../App.css";
import ViewRouteData from "./ViewRouteData";

const Home = ({ isLoggedIn, setIsLoggedIn }) => {
  const [viewRegistration, setViewRegistration] = React.useState(false);
  const [viewLogin, setViewLogin] = React.useState(true);

  if (isLoggedIn) {
    return <ViewRouteData />; // Redirect to ViewRouteData if logged in
  } else {

    return (
      <>

      <div className="home">
        <div className="home-bg" />
        <h1 className="title">Route Scan</h1>
        <div className="login">
          {viewRegistration && <RegistrationForm />}
          {viewLogin && <LoginForm onLogin={() => setIsLoggedIn(true)} />}
          {viewRegistration && (
            <span
              onClick={() => {
                setViewRegistration(false);
                setViewLogin(true);
              }}
              style={{ color: "#e4ff92", cursor: "pointer", textDecoration: "underline" }}
            >
              Login
            </span>
          )}
          {viewLogin && (
            <span
              onClick={() => {
                setViewRegistration(true);
                setViewLogin(false);
              }}
              style={{ color: "#e4ff92", cursor: "pointer", fontSize: 22 }}
            >
              Register
            </span>
          )}
        </div>
        <button
          onClick={() => {
            sessionStorage.setItem('userName', 'Demo');
            setIsLoggedIn(true);
          }}
          style={{ marginTop: "30px", border: "3px solid #c6ff1d", textAlign: "center", padding: "0px"}}
        >
          Demo
        </button>
      </div>


      </>
    );
  }
};

  export default Home;


