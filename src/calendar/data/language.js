import { fetchNavigationItems } from "services/menuService";
import { useState, useEffect } from "react";
import { language } from "schedule-and-details/__mocks__/courseDetails";

const language = () => {
  const [language, setLanguage] = useState(""); 

  useEffect(() => {
    fetchNavigationItems().then((data) => {
      console.log("Language from API:", data.language);
      setLanguage(data.language);
    });
  }, []);

  return language; 
};

export default language;
