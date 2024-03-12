import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from '@openedx/paragon';

const Sidebar = ({ className, children, ...props }) => (
  <Card
    className={classNames('course-unit-sidebar', className)}
    {...props}
  >
    {children}
  </Card>
);

Sidebar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Sidebar.defaultProps = {
  className: null,
  children: null,
};

export default Sidebar;
