import React from 'react';
import PropTypes from 'prop-types';

import { Collapsible, Icon, IconButton } from '@edx/paragon';
import { Delete, ExpandLess, ExpandMore } from '@edx/paragon/icons';

const CollapsableEditor = ({
  title,
  open,
  defaultOpen,
  onToggle,
  onClose,
  onDelete,
  children,
  expandAlt,
  deleteAlt,
  collapseAlt,
  ...props
}) => (
  <Collapsible.Advanced
    className="collapsible-card rounded mb-3 px-3 py-2"
    onToggle={onToggle}
    onClose={onClose}
    defaultOpen={defaultOpen}
    open={open}
    {...props}
  >
    <Collapsible.Trigger
      className="collapsible-trigger d-flex border-0"
      style={{ justifyContent: 'unset' }}
    >
      <div className="d-flex flex-grow-1">
        {title}
      </div>
      <Collapsible.Visible whenClosed>
        <IconButton
          alt={expandAlt}
          src={ExpandMore}
          iconAs={Icon}
          onClick={() => {}}
          variant="dark"
        />
      </Collapsible.Visible>
      <Collapsible.Visible whenOpen>
        {onDelete && (
          <div className="pr-4 border-right">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              alt={deleteAlt}
              src={Delete}
              iconAs={Icon}
              variant="dark"
            />
          </div>
        )}
        <div className="pl-4">
          <IconButton
            alt={collapseAlt}
            src={ExpandLess}
            iconAs={Icon}
            onClick={() => {}}
            variant="dark"
          />
        </div>
      </Collapsible.Visible>
    </Collapsible.Trigger>
    <Collapsible.Body className="collapsible-body rounded px-0">
      {children}
    </Collapsible.Body>
  </Collapsible.Advanced>
);

CollapsableEditor.propTypes = {
  open: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  title: PropTypes.node.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  children: PropTypes.node.isRequired,
  expandAlt: PropTypes.string.isRequired,
  deleteAlt: PropTypes.string.isRequired,
  collapseAlt: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

CollapsableEditor.defaultProps = {
  onDelete: null,
  defaultOpen: undefined,
  open: undefined,
  onClose: () => {},
};

export default CollapsableEditor;
