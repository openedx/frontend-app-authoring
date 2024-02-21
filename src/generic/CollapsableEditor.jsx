import { Collapsible, Icon, IconButton } from '@openedx/paragon';
import { Delete, ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import React from 'react';

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
      className="collapsible-trigger d-flex border-0 align-items-center"
      style={{ justifyContent: 'unset' }}
    >
      <div className="d-flex flex-grow-1 w-75">{title}</div>
      <Collapsible.Visible whenClosed>
        <div className="align-self-start">
          <IconButton alt={expandAlt} src={ExpandMore} iconAs={Icon} variant="dark" />
        </div>
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
        <div className="pl-4 d-flex">
          <IconButton alt={collapseAlt} src={ExpandLess} iconAs={Icon} variant="dark" />
        </div>
      </Collapsible.Visible>
    </Collapsible.Trigger>
    <Collapsible.Body className="collapsible-body rounded px-0">{children}</Collapsible.Body>
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
  onClose: () => {
  },
};

export default React.memo(CollapsableEditor);
