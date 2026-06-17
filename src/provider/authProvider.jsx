import api from '../utils/api'
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { socket } from '../socket';
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState(localStorage.getItem("token"));

  // Function to set the authentication token
  const setToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
      const authParse = JSON.parse(token);
      api.defaults.headers.common["Authorization"] = "Bearer " + authParse.token;
      socket.auth = {
        token: authParse.token
      }
      socket.connect();
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
