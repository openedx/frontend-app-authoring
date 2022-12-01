import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, IconButton } from '@edx/paragon';
import { ExpandLess, ExpandMore, Info } from '@edx/paragon/icons';

import messages from './messages';

/**
 * Simple Wrapper for a Form Widget component in the Video Settings modal
 * Takes a title element and children, and produces a collapsible widget container
 * <CollapsibleFormWidget title={<h1>My Title</h1>}>
 *   <div>My Widget</div>
 * </CollapsibleFormWidget>
 */
export const CollapsibleFormWidget = ({
  children,
  isError,
  subtitle,
  title,
  fontSize,
  // injected
  intl,
}) => (
  <Collapsible.Advanced
    className="collapsible-card rounded mx-4 my-3 px-3 py-2 text-primary-500"
    defaultOpen
    open={isError || undefined}
  >
    <Collapsible.Trigger
      className="collapsible-trigger d-flex border-0 align-items-center"
      style={{ justifyContent: 'unset' }}
    >
      <Collapsible.Visible whenClosed>
        <div className="d-flex flex-column flex-grow-1">
          <div className="d-flex flex-grow-1 w-75 x-small">{title}</div>
          <div className={`${fontSize}`}>{subtitle}</div>
        </div>
        <div className="d-flex flex-row align-self-start">
          {isError && <Icon className="alert-icon" src={Info} />}
          <IconButton alt={intl.formatMessage(messages.expandAltText)} src={ExpandMore} iconAs={Icon} variant="dark" />
        </div>
      </Collapsible.Visible>
      <Collapsible.Visible whenOpen>
        <div className="d-flex flex-grow-1 w-75 x-small">{title}</div>
        <div className="align-self-start">
          <IconButton alt={intl.formatMessage(messages.collapseAltText)} src={ExpandLess} iconAs={Icon} variant="dark" />
        </div>
      </Collapsible.Visible>
    </Collapsible.Trigger>
    <Collapsible.Body className={`collapsible-body rounded px-0 ${fontSize}`}>
      {children}
    </Collapsible.Body>
  </Collapsible.Advanced>
);

CollapsibleFormWidget.defaultProps = {
  subtitle: null,
  fontSize: '',
};

CollapsibleFormWidget.propTypes = {
  children: PropTypes.node.isRequired,
  isError: PropTypes.bool.isRequired,
  subtitle: PropTypes.node,
  title: PropTypes.node.isRequired,
  fontSize: PropTypes.string,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(CollapsibleFormWidget);
