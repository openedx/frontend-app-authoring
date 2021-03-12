import React from 'react';
import PropTypes from 'prop-types';
import { ModalCloseButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import classNames from 'classnames';

export default function FullScreenModalHeader({ className, title }) {
  return (
    <div
      className={classNames(
        'bg-primary',
        'text-white',
        'd-flex',
        'justify-content-between',
        'align-items-center',
        className,
      )}
    >
      <h2 className="pl-3 h6 mb-0">{title}</h2>
      <ModalCloseButton variant="outline-link" className="text-white">
        <Close />
      </ModalCloseButton>
    </div>
  );
}

FullScreenModalHeader.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
};

FullScreenModalHeader.defaultProps = {
  className: null,
};
