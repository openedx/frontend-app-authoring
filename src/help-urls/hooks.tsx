import { HelpUrls } from './data/api';
import { useAllHelpUrls } from './data/apiHooks';

const useHelpUrls = <T extends string[]>(tokenNames: T & (keyof HelpUrls)[]): {
  [K in T[number]]?: K extends keyof HelpUrls ? string : null
} => {
  const {
    data: pages,
  } = useAllHelpUrls();

  const urlsDictionary = {};

  if (pages) {
    tokenNames.forEach(name => {
      urlsDictionary[name] = pages[name] || null;
    });
  }

  return urlsDictionary;
};

export { useHelpUrls };
