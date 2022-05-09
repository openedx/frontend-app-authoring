import React from 'react';
import PropTypes from 'prop-types';

import { Collapsible } from '@edx/paragon';

/**
 * Simple Wrapper for a Form Widget component in the Video Settings modal
 * Takes a title element and children, and produces a collapsible widget container
 * <CollapsibleFormWidget title={<h1>My Title</h1>}>
 *   <div>My Widget</div>
 * </CollapsibleFormWidget>
 */
export const CollapsibleFormWidget = ({
  title,
  children,
}) => (
  <Collapsible defaultOpen title={title}>
    {children}
  </Collapsible>
);
CollapsibleFormWidget.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default CollapsibleFormWidget;
