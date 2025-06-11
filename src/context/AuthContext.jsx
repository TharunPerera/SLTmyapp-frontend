// // src/context/AuthContext.js
// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is logged in on initial load
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (userData) => {
//     try {
//       setUser(userData);
//       localStorage.setItem('user', JSON.stringify(userData));

//       // Redirect based on role
//       switch(userData.role) {
//         case 'Admin':
//           navigate('/admin');
//           break;
//         case 'Executive Officer':
//           navigate('/executive-approve');
//           break;
//         case 'Duty Officer':
//           navigate('/verify');
//           break;
//         case 'Security Officer':
//           navigate('/dispatch');
//           break;
//         case 'Employee':
//         default:
//           navigate('/gate-pass');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      setUser({
        serviceNumber: userData.serviceNumber,
        name: userData.name,
        role: userData.role,
        employmentType: userData.employmentType,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          serviceNumber: userData.serviceNumber,
          name: userData.name,
          role: userData.role,
          employmentType: userData.employmentType,
        })
      );

      switch (userData.role) {
        case "EMPLOYEE":
          navigate("/gate-pass");
          break;
        case "EXECUTIVE":
          navigate("/executive-approve");
          break;
        case "DUTY_OFFICER":
          navigate("/verify");
          break;
        default:
          navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
