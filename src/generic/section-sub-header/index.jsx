import React from 'react';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const SectionSubHeader = ({ title, description }) => (
  <PluginSlot
    id="grading_sub_header_styleplugin_slot"
    pluginProps={{
      title,
      description,
    }}
  >
    <header className="section-sub-header">
      <h2 className="lead">{title}</h2>
      <span className="small text-gray-700">{description}</span>
    </header>
  </PluginSlot>
);

SectionSubHeader.defaultProps = {
  description: '',
};

SectionSubHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default SectionSubHeader;
