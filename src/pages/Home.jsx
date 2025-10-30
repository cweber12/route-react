import React from "react";
import RegistrationForm from "../components/auth/RegistrationForm";
import LoginForm from "../components/auth/LoginForm";
import "../App.css";
import ViewRouteData from "./ViewRouteData";

const Home = ({ isLoggedIn, setIsLoggedIn }) => {
  const [viewRegistration, setViewRegistration] = React.useState(false);
  const [viewLogin, setViewLogin] = React.useState(true);

  if (isLoggedIn) {
    return <ViewRouteData />;
  } else {

    return (
      <>
      <div className="landing-page-container">
        <div className="title">
          <h1 >RouteScan</h1>
          </div>
        <div className="auth-container">
          {viewRegistration && <RegistrationForm />}
          {viewLogin && <LoginForm onLogin={() => setIsLoggedIn(true)} />}
          {viewRegistration && (
            <span
              onClick={() => {
                setViewRegistration(false);
                setViewLogin(true);
              }}
              style={{ color: "#ffffffff", cursor: "pointer", textDecoration: "underline", fontSize: 22  }}
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
              style={{ color: "#ffffffff", cursor: "pointer", textDecoration: "underline", fontSize: 22 }}
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
          className="demo-button"
        >
          Demo
        </button>
        <button className="demo-button">
          <a 
            href="/example-videos"
            style={{color: "black"}}
          >
            Example Videos
          </a>
        </button>
      </div>


      </>
    );
  }
};

  export default Home;


