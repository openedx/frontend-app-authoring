import { useAllHelpUrls } from './data/apiHooks';

const useHelpUrls = (tokenNames) => {
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
