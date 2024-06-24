import React from 'react';
import { ArrowDropDown } from '@openedx/paragon/icons';
import {
  Badge,
  Button,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';

/**
 * A button that represents a filter on the search.
 * If the filter is active, the button displays the currently applied values.
 * So when no filter is active it may look like:
 *  [ Type ▼ ]
 * Or when a filter is active and limited to two values, it may look like:
 *  [ Type: HTML, +1 ▼ ]
 *
 * When clicked, the button will display a dropdown menu containing this
 * element's `children`. So use this to wrap a <RefinementList> etc.
 */
const SearchFilterWidget: React.FC<{
  appliedFilters: { label: React.ReactNode }[];
  label: React.ReactNode;
  children: React.ReactNode;
}> = ({ appliedFilters, ...props }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState(null);

  return (
    <>
      <div className="d-flex mr-3">
        <Button
          ref={setTarget}
          variant={appliedFilters.length ? 'light' : 'outline-primary'}
          size="sm"
          onClick={open}
          iconAfter={ArrowDropDown}
        >
          {props.label}
          {appliedFilters.length >= 1 ? <>: {appliedFilters[0].label}</> : null}
          {appliedFilters.length > 1 ? <>,&nbsp;<Badge variant="secondary">+{appliedFilters.length - 1}</Badge></> : null}
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
