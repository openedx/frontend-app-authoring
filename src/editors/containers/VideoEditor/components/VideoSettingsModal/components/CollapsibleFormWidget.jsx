import React from 'react';
import PropTypes from 'prop-types';

import { Collapsible } from '@edx/paragon';

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
