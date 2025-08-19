import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Cookies from "universal-cookie";

import en from "./languages/en.json";
import hi from "./languages/hi.json";
import ar from "./languages/ar.json";
import fr from "./languages/fr.json";
import de from "./languages/de.json";
import ja from "./languages/ja.json";
import zh from "./languages/zh.json";

// import config from "../data/config.json";


const cookies = new Cookies();

const langFromCookie = cookies.get("openedx-language-preference") || "en";




const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ar: { translation: ar },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  zh: { translation: zh }
};


i18n.use(initReactI18next).init({
  resources,
  lng: langFromCookie,  // ✅ string pass karna hai
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

// i18n.use(initReactI18next).init({
//   resources,
//   lng: config.language || "en",
//   fallbackLng: "en",
//   interpolation: { escapeValue: false }
// });

export default i18n;



