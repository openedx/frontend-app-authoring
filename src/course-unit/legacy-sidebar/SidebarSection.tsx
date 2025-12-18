import classNames from 'classnames';
import { Card } from '@openedx/paragon';

const SidebarSection = ({ className = null, children = null, ...props }:SidebarSectionProps) => (
  <Card
    className={classNames('course-unit-sidebar', className)}
    {...props}
  >
    {children}
  </Card>
);

interface SidebarSectionProps {
  className?: string | null;
  children?: React.ReactNode | null;
}

export default SidebarSection;
