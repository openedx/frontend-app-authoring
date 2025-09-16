import {
  useState, useCallback, useMemo,
} from 'react';
import Cookies from 'universal-cookie';
import { getLocale } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';

type SupportedLanguage = 'en' | 'vi';

interface LanguageOption {
  readonly value: SupportedLanguage;
  readonly label: string;
}

const LANGUAGE_COOKIE_NAME = 'openedx-language-preference';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
const RELOAD_DELAY = 50; // milliseconds

const LANGUAGE_OPTIONS: readonly [LanguageOption, LanguageOption] = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
] as const;

const isValidLanguage = (lang: string): lang is SupportedLanguage => lang === 'en' || lang === 'vi';

const getInitialLanguage = (cookies: Cookies): SupportedLanguage => {
  const cookieLanguage = cookies.get(LANGUAGE_COOKIE_NAME);
  const currentLocale = getLocale();

  // Priority: cookie > current locale > default fallback
  if (cookieLanguage && isValidLanguage(cookieLanguage)) {
    return cookieLanguage;
  }

  return isValidLanguage(currentLocale) ? currentLocale : 'en';
};

export const useLanguageSwitch = () => {
  const lmsHost = new URL(getConfig().LMS_BASE_URL).hostname;
  const cookies = useMemo(() => new Cookies(), []);

  const [language, setLanguage] = useState<SupportedLanguage>(
    () => getInitialLanguage(cookies),
  );

  const toggleLanguage = useCallback((newLanguage: SupportedLanguage) => {
    if (newLanguage === language) {
      return;
    }
    setLanguage(newLanguage);
    cookies.set(LANGUAGE_COOKIE_NAME, newLanguage, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      domain: lmsHost,
    });

    setTimeout(() => window.location.reload(), RELOAD_DELAY);
  }, [language, cookies, lmsHost]);

  return {
    language,
    languageOptions: LANGUAGE_OPTIONS,
    toggleLanguage,
  } as const;
};
