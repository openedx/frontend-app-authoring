import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';

const TagsTree = ({ tags, rootDepth }) => {
  if (tags === undefined) {
    return null;
  }

  // Generate tabs for the parents of this tree
  const tabs = Array.from({
    length: rootDepth,
  }).map(() => <span className="d-inline-block ml-4" />);

  return (
    <div className="tags-tree">
      {Object.keys(tags).map((key) => (
        <div className="mt-1.5 mb-1.5">
          <div className="d-flex pl-2.5">
            {tabs}<Icon src={Tag} className="mr-1 pb-1.5 text-info-500" />{key}
          </div>
          { tags[key].children && <TagsTree tags={tags[key].children} rootDepth={rootDepth + 1} /> }
        </div>
      ))}
    </div>
  );
};

TagsTree.propTypes = {
  tags: PropTypes.shape({}).isRequired,
  rootDepth: PropTypes.number,
};

TagsTree.defaultProps = {
  rootDepth: 0,
};

export default TagsTree;
