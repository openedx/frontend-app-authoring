export const selectHelpUrlsByNames = (names) => (state) => {
  const urlsDictionary = {};

  names.forEach(name => {
    urlsDictionary[name] = state.helpUrls.pages[name] || null;
  });

  return urlsDictionary;
};

export const getPages = (state) => state.helpUrls.pages;

export const getLoadingHelpUrlsStatus = (state) => state.helpUrls.loadingHelpUrlsStatus;
