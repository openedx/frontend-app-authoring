// eslint-disable-next-line import/prefer-default-export
export const extractOrgFromContentId = (contentId) => contentId.split('+')[0].split(':')[1];
