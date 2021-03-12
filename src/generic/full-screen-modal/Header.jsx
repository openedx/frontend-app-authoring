import React from 'react';
import PropTypes from 'prop-types';
import { ModalCloseButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import classNames from 'classnames';

export default function Header({ className, title }) {
  return (
    <div
      className={classNames(
        'bg-primary',
        'd-flex',
        'justify-content-between',
        'align-items-center',
        className,
      )}
    >
      <h3 className="text-white pl-3 mb-0">{title}</h3>
      <ModalCloseButton variant="outline-link" className="text-white">
        <Close />
      </ModalCloseButton>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
};

Header.defaultProps = {
  className: null,
};
