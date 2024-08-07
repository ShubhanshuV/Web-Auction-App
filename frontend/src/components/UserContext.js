import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/user/status')
      .then(response => {
        if (response.data.isLoggedIn) {
          setUser(response.data.user);
        }
      })
      .catch(error => {
        console.error("Error checking user login status", error);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
