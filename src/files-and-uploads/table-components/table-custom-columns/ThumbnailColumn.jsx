import React from 'react';
import { PropTypes } from 'prop-types';
import { Icon, Image } from '@edx/paragon';
import { getSrc } from '../../data/utils';

const ThumbnailColumn = ({ row }) => {
  const { thumbnail, wrapperType } = row.original;
  const src = getSrc({ thumbnail, wrapperType });
  return (
    thumbnail ? (
      <Image src={src} style={{ width: '96.43px', height: '54px' }} className="border rounded p-1" />
    ) : (
      <div className="row border justify-content-center align-items-center rounded m-0" style={{ width: '96.43px', height: '54px' }}>
        <Icon src={src} style={{ height: '48px', width: '48px' }} />
      </div>
    )
  );
};

ThumbnailColumn.propTypes = {
  row: {
    original: {
      thumbnail: PropTypes.string,
      wrapperType: PropTypes.string.isRequired,
    }.isRequired,
  }.isRequired,
};

export default ThumbnailColumn;
