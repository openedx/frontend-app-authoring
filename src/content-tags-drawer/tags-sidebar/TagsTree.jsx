import PropTypes from 'prop-types';

const TagsTree = ({ tags, tabNumber }) => {
  if (tags === undefined) {
    return null;
  }

  // Generate tabs for the parents of this tree
  const tabs = Array.from({
    length: tabNumber,
  }).map(() => <span className="tab" />);

  return (
    <div className="tags-tree">
      {Object.keys(tags).map((key) => (
        <div>
          {tabs}{key}
          { tags[key].children && <TagsTree tags={tags[key].children} tabNumber={tabNumber + 1} /> }
        </div>
      ))}
    </div>
  );
};

TagsTree.propTypes = {
  tags: PropTypes.shape({}).isRequired,
  tabNumber: PropTypes.number,
};

TagsTree.defaultProps = {
  tabNumber: 0,
};

export default TagsTree;
