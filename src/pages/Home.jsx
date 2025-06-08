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
      <div className="parallax-bg" ></div>
      <div className="home">
        <h1 className="title">RouteSketch</h1>
        
          <div className="login" >
              <h1 style={{fontWeight: "500"}} >
                {viewRegistration ? "Register" : "Login"} 
              </h1>
              {viewRegistration && <RegistrationForm />}
              {viewLogin && <LoginForm onLogin={() => setIsLoggedIn(true)} />}

              {viewRegistration && (
                <p style={{width: "220px"}}>
                  Already have an account?{" "}
                  <span 
                  onClick={() => {
                    setViewRegistration(false);
                    setViewLogin(true);
                  }} 
                  style={{ color: "#a9c52f", cursor: "pointer", textDecoration: "underline" }}>
                    Login
                  </span>
                </p>
              )}
              {viewLogin && (
                <p style={{width: "220px"}}>
                  Don't have an account?{" "}
                  <span 
                    onClick={() => {
                      setViewRegistration(true);
                      setViewLogin(false);
                    }} 
                    style={{ color: "#a9c52f", cursor: "pointer", textDecoration: "underline" }}>
                    Register
                  </span>
                </p>
              )}
            </div>

        </div>

      </>
    );
  };
}

  export default Home;


