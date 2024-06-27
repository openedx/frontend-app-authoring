const getLocatorSafeName = ({ displayName }) => {
  const locatorSafeName = displayName.replace(/[^\w.%-]/gm, '');
  return locatorSafeName;
};

export const getStaticUrl = ({ displayName }) => (`/static/${getLocatorSafeName({ displayName })}`);

export const getRelativeUrl = ({ courseId, displayName }) => {
  if (displayName) {
    const assetCourseId = courseId.replace('course', 'asset');
    const assetPathShell = `/${assetCourseId}+type@asset+block@`;
    return `${assetPathShell}${displayName}`;
  }
  return '';
};
