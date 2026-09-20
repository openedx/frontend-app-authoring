import TagsSidebarHeader from './TagsSidebarHeader';
import TagsSidebarBody from './TagsSidebarBody';

interface TagsSidebarControlsProps {
  readOnly: boolean;
  canManageTags?: boolean;
}

const TagsSidebarControls = ({ readOnly, canManageTags = true }: TagsSidebarControlsProps) => (
  <>
    <TagsSidebarHeader />
    <TagsSidebarBody readOnly={readOnly} canManageTags={canManageTags} />
  </>
);

TagsSidebarControls.propTypes = {};

export default TagsSidebarControls;
