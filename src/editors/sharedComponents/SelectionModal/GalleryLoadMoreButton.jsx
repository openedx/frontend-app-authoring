import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, StatefulButton } from '@openedx/paragon';
import { ExpandMore, SpinnerSimple } from '@openedx/paragon/icons';

const GalleryLoadMoreButton = ({
  assetCount,
  displayListLength,
  fetchNextPage,
  isLoaded,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = () => {
    fetchNextPage({ pageNumber: currentPage });
    setCurrentPage(currentPage + 1);
  };
  const buttonState = isLoaded ? 'default' : 'pending';
  const buttonProps = {
    labels: {
      default: 'Load more',
      pending: 'Loading',
    },
    icons: {
      default: <Icon src={ExpandMore} />,
      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
    },
    disabledStates: ['pending'],
    variant: 'primary',
  };

  return (
    <div className="row justify-content-center py-3">
      {displayListLength !== assetCount && (
        <StatefulButton
          {...buttonProps}
          onClick={handlePageChange}
          state={buttonState}
        />
      )}
    </div>
  );
};

GalleryLoadMoreButton.propTypes = {
  assetCount: PropTypes.number.isRequired,
  displayListLength: PropTypes.number.isRequired,
  fetchNextPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export default GalleryLoadMoreButton;
