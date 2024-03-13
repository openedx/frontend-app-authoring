import PropTypes from 'prop-types';
import { Icon, Button } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';
import classNames from 'classnames';

const TagCount = ({ count, onClick }) => {
  const renderContent = () => (
    <>
      <Icon className="mr-1 pt-1" src={Tag} />
      {count}
    </>
  );

  return (
    <div className={
      classNames('generic-tag-count d-flex', { 'zero-count': count === 0 })
    }
    >
      { onClick ? (
        <Button variant="tertiary" onClick={onClick}>
          {renderContent()}
        </Button>
      )
        : renderContent()}
    </div>
  );
};

TagCount.defaultProps = {
  onClick: undefined,
};

TagCount.propTypes = {
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

export default TagCount;
