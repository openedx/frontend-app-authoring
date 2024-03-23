/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import {
  Button,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';

/** @type {React.FC<{appliedFilters: string[], label: React.ReactNode, children: React.ReactNode}>} */
const SearchFilterWidget = (props) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState(null);

  return (
    <>
      <div className="d-flex mr-3">
        <Button
          ref={setTarget}
          variant="outline-primary"
          onClick={open}
        >
          {props.label}
        </Button>
      </div>
      <ModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <div
          className="bg-white p-3 rounded shadow"
          style={{ textAlign: 'start' }}
        >
          {props.children}
        </div>
      </ModalPopup>
    </>
  );
};

export default SearchFilterWidget;
