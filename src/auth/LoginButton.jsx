// src/auth/AuthButtons.jsx
import { TbLogin2 } from "react-icons/tb";
import HeaderProfile from "../context/HeaderProfile";
import { useAuth0 } from "@auth0/auth0-react";

const AuthButtons = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return isAuthenticated ? (
    <HeaderProfile />
  ) : (
    <button
    className="flex items-center gap-1"
      onClick={() => loginWithRedirect()}
    >
      Log In
      <TbLogin2 className="md:hidden" size={20}/>
    </button>
  );
};

export default AuthButtons;