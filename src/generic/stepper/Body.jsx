import React, {
  useCallback, useContext, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StepperContext } from './StepperContext';

export default function Body({ children, className }) {
  const { setIsAtTop, setIsAtBottom } = useContext(StepperContext);

  const ref = useRef();

  const handleScroll = useCallback(() => {
    setIsAtTop(ref.current.scrollTop === 0);
    setIsAtBottom(ref.current.offsetHeight + ref.current.scrollTop === ref.current.scrollHeight);
  }, []);

  useEffect(() => {
    if (ref) {
      setIsAtTop(ref.current.scrollTop === 0);
      setIsAtBottom(ref.current.offsetHeight + ref.current.scrollTop === ref.current.scrollHeight);
    }
  }, [ref.current ? ref.current.scrollHeight : 0]);

  return (
    <div
      ref={ref}
      className={classNames(
        'overflow-auto',
        'flex-grow-1',
        className,
      )}
      onScroll={handleScroll}
    >
      {children}
    </div>
  );
}

Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Body.defaultProps = {
  className: null,
};
