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
        <h1 className="title">RouteScan</h1>
        
          <div className="login" >
      
              {viewRegistration && <RegistrationForm />}
              {viewLogin && <LoginForm onLogin={() => setIsLoggedIn(true)} />}

              {viewRegistration && (
                  <span 
                  onClick={() => {
                    setViewRegistration(false);
                    setViewLogin(true);
                  }} 
                  style={{ color: "#e4ff92", cursor: "pointer", textDecoration: "underline" }}>
                    Login
                  </span>
              )}
              {viewLogin && (
                  <span 
                    onClick={() => {
                      setViewRegistration(true);
                      setViewLogin(false);
                    }} 
                    style={{ color: "#e4ff92", cursor: "pointer", fontSize: 22}}>
                    Register
                  </span>
              )}
            </div>

        </div>

      </>
    );
  };
}

  export default Home;


