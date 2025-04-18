import TagsSidebarHeader from './TagsSidebarHeader';
import TagsSidebarBody from './TagsSidebarBody';

interface TagsSidebarControlsProps {
  readOnly: boolean,
}

const TagsSidebarControls = ({ readOnly }: TagsSidebarControlsProps) => (
  <>
    <TagsSidebarHeader />
    <TagsSidebarBody readOnly={readOnly} />
  </>
);

TagsSidebarControls.propTypes = {};

export default TagsSidebarControls;
