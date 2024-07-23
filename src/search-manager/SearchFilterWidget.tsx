import React from 'react';
import { ArrowDropDown } from '@openedx/paragon/icons';
import {
  Badge,
  Button,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

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
  clearFilter: () => void,
  icon: React.ComponentType;
}> = ({ appliedFilters, ...props }) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState<HTMLButtonElement | null>(null);

  const clearAndClose = React.useCallback(() => {
    props.clearFilter();
    close();
  }, [props.clearFilter]);

  return (
    <>
      <div className="d-flex mr-3">
        <Button
          ref={setTarget}
          variant={appliedFilters.length ? 'light' : 'outline-primary'}
          size="sm"
          onClick={open}
          iconBefore={props.icon}
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

          {
            !!appliedFilters.length
            && (
              <div className="d-flex justify-content-end">
                <Button
                  onClick={clearAndClose}
                  variant="link"
                  className="text-info-500 text-decoration-none clear-filter-button"
                >
                  { intl.formatMessage(messages.clearFilter) }
                </Button>
              </div>
            )
          }
        </div>
      </ModalPopup>
    </>
  );
};

export default SearchFilterWidget;
