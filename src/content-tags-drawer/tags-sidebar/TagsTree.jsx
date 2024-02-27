import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';

const TagsTree = ({ tags, rootDepth, parentKey }) => {
  if (Object.keys(tags).length === 0) {
    return null;
  }

  // Used to Generate tabs for the parents of this tree
  const tabsNumberArray = Array.from({ length: rootDepth }, (_, index) => index + 1);

  return (
    <div className="tags-tree" key={parentKey}>
      {Object.keys(tags).map((key) => (
        <div className="mt-1.5 mb-1.5" key={key}>
          <div className="d-flex pl-2.5" key={key}>
            {
              tabsNumberArray.map((index) => <span className="d-inline-block ml-4" key={`${key}-${index}`} />)
            }
            <Icon src={Tag} className="mr-1 pb-1.5 text-info-500" />{key}
          </div>
          { tags[key].children
            && (
              <TagsTree
                tags={tags[key].children}
                rootDepth={rootDepth + 1}
                parentKey={key}
              />
            )}
        </div>
      ))}
    </div>
  );
};

TagsTree.propTypes = {
  tags: PropTypes.shape({}).isRequired,
  parentKey: PropTypes.string,
  rootDepth: PropTypes.number,
};

TagsTree.defaultProps = {
  rootDepth: 0,
  parentKey: undefined,
};

export default TagsTree;
