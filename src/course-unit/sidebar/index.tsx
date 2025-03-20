import classNames from 'classnames';
import { Card } from '@openedx/paragon';

const Sidebar = ({ className = null, children = null, ...props }:SidebarProps) => (
  <Card
    className={classNames('course-unit-sidebar', className)}
    {...props}
  >
    {children}
  </Card>
);

interface SidebarProps {
  className?: string | null;
  children?: React.ReactNode | null;
}

export default Sidebar;
