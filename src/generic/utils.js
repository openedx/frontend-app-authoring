import { isEmpty } from 'lodash';

const getPageHeadTitle = (courseName, pageName) => {
  if (isEmpty(courseName)) {
    return `${pageName} | ${process.env.SITE_NAME}`;
  }
  return `${pageName} | ${courseName} | ${process.env.SITE_NAME}`;
};

export default getPageHeadTitle;
