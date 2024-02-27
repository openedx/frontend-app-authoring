import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';
import classNames from 'classnames';

const TagCount = ({ count }) => (
  <div className={
    classNames('generic-tag-count d-flex', { 'zero-count': count === 0 })
  }
  >
    <Icon className="mr-1 pt-1" src={Tag} />
    {count}
  </div>
);

TagCount.propTypes = {
  count: PropTypes.number.isRequired,
};

export default TagCount;
