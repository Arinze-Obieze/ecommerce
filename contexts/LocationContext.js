"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [selectedState, setSelectedState] = useState("");

  // Persist location in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("selectedState");
    if (savedState) setSelectedState(savedState);
  }, []);

  useEffect(() => {
    if (selectedState) localStorage.setItem("selectedState", selectedState);
  }, [selectedState]);

  return (
    <LocationContext.Provider value={{ selectedState, setSelectedState }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
