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

export const parseAssetName = (relativeUrl) => {
  let assetName = '';
  if (relativeUrl.match(/\/asset-v1:\S+[+]\S+[@]\S+[+]\S+\/\w/)?.length >= 1) {
    const assetBlockName = relativeUrl.substring(0, relativeUrl.search(/("|&quot;)/));
    const dividedSrc = assetBlockName.split(/\/asset-v1:\S+[+]\S+[@]\S+[+]\S+\//);
    [, assetName] = dividedSrc;
  } else {
    const assetBlockName = relativeUrl.substring(relativeUrl.indexOf('@') + 1, relativeUrl.search(/("|&quot;)/));
    assetName = assetBlockName.substring(assetBlockName.indexOf('@') + 1);
  }
  return assetName;
};
