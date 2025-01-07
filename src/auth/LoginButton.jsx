// src/auth/AuthButtons.jsx
import { LogIn } from "lucide-react";
import HeaderProfile from "../context/HeaderProfile";
import { useAuth0 } from "@auth0/auth0-react";
import Tooltip from "../components/ui/Tooltip";

const AuthButtons = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return isAuthenticated ? (
    <HeaderProfile />
  ) : (
    <Tooltip placement="bottom" content={'Login'}>
      <button
        className="flex items-center gap-1 text-xs"
        onClick={() => loginWithRedirect()}
        aria-label="log in"
      >
        <span className="md:hidden">Log In</span>
        <LogIn size={20} />
      </button>
    </Tooltip>
  );
};

export default AuthButtons;
