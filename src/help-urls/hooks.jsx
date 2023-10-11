import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';

import { fetchHelpUrls } from './data/thunks';
import { getPages, selectHelpUrlsByNames } from './data/selectors';

const useHelpUrls = (tokenNames) => {
  const dispatch = useDispatch();
  const helpTokens = useSelector(selectHelpUrlsByNames(tokenNames));
  const pages = useSelector(getPages);

  useEffect(() => {
    if (isEmpty(pages)) {
      dispatch(fetchHelpUrls());
    }
  }, []);

  return helpTokens;
};
/* eslint-disable-next-line import/prefer-default-export */
export { useHelpUrls };
