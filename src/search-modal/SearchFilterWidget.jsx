/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { ArrowDropDown } from '@openedx/paragon/icons';
import {
  Badge,
  Button,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';

/** @type {React.FC<{appliedFilters: {label: string}[], label: React.ReactNode, children: React.ReactNode}>} */
const SearchFilterWidget = (props) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState(null);

  return (
    <>
      <div className="d-flex mr-3">
        <Button
          ref={setTarget}
          variant="light"
          onClick={open}
          iconAfter={ArrowDropDown}
        >
          {props.label}
          {props.appliedFilters.length >= 1 ? <>: {props.appliedFilters[0].label}</> : null}
          {props.appliedFilters.length > 1 ? <>,&nbsp;<Badge variant="info">+{props.appliedFilters.length - 1}</Badge></> : null}
        </Button>
      </div>
      <ModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
      >
        <div
          className="bg-white rounded shadow"
          style={{ textAlign: 'start' }}
        >
          {props.children}
        </div>
      </ModalPopup>
    </>
  );
};

export default SearchFilterWidget;
