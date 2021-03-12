import React from 'react';
import PropTypes from 'prop-types';
import { ModalLayer } from '@edx/paragon';
import classNames from 'classnames';
import Header from './Header';
import Body from './Body';

export default function FullScreenModal({ children, title, onClose }) {
  return (
    <ModalLayer isOpen onClose={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className={classNames(
          'bg-white',
          'd-flex',
          'flex-column',
          'vw-100',
          'vh-100',
        )}
      >
        {children}
      </div>
    </ModalLayer>
  );
}

FullScreenModal.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

FullScreenModal.Header = Header;
FullScreenModal.Body = Body;
