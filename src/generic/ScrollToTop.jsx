import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

/*
 * Used to reset the scroll to the top.
 *
 * TODO: After uptade react-router to 6.20 we can replace this
 * with ScrollRestoration.Currently it throws an error.
 * https://reactrouter.com/en/6.20.1/routers/picking-a-router
 */
const ScrollToTop = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return children;
};

ScrollToTop.propTypes = {
  children: PropTypes.element.isRequired,
};

export default ScrollToTop;
