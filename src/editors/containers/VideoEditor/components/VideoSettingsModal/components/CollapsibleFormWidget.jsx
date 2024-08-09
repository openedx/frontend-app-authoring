import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon, IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore, InfoOutline } from '@openedx/paragon/icons';

import messages from './messages';

/**
 * Simple Wrapper for a Form Widget component in the Video Settings modal
 * Takes a title element and children, and produces a collapsible widget container
 * <CollapsibleFormWidget title={<h1>My Title</h1>}>
 *   <div>My Widget</div>
 * </CollapsibleFormWidget>
 */
const CollapsibleFormWidget = ({
  children,
  isError,
  subtitle,
  title,
  fontSize,
  // injected
  intl,
}) => (
  <Collapsible.Advanced
    className="collapsible-card rounded mx-4 my-3 px-4 text-primary-500"
    defaultOpen
    open={isError || undefined}
  >
    <Collapsible.Trigger
      className="collapsible-trigger d-flex border-0 align-items-center pt-4 p-0"
      style={{ justifyContent: 'unset' }}
    >
      <Collapsible.Visible whenClosed className="p-0 pb-3">
        <div className="d-flex flex-column flex-grow-1">
          <div className="d-flex flex-grow-1 w-75 x-small">{title}</div>
          {subtitle ? <div className={`${fontSize} mb-4 mt-3`}>{subtitle}</div> : <div className="mb-4" />}
        </div>
        <div className="d-flex flex-row align-self-start">
          {isError && <Icon className="alert-icon" src={InfoOutline} />}
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
    <Collapsible.Body className={`collapsible-body rounded px-0 ${fontSize} pb-4`}>
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

export const CollapsibleFormWidgetInternal = CollapsibleFormWidget; // For testing only
export default injectIntl(CollapsibleFormWidget);
