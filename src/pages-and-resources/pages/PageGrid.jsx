import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { CardGrid } from '@openedx/paragon';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import PageCard, { CoursePageShape } from './PageCard';

const PageGrid = ({ pages, pluginSlotId, courseId }) => (
  <CardGrid columnSizes={{
    xs: 12,
    sm: 6,
    lg: 4,
    xl: 4,
  }}
  >
    {pages.map((page) => (
      <PageCard page={page} key={page.id} courseId={courseId} />
    ))}
    {pluginSlotId && <PluginSlot id={pluginSlotId} />}
  </CardGrid>
);

PageGrid.defaultProps = {
  pluginSlotId: null,
  courseId: null,
};

PageGrid.propTypes = {
  pages: PropTypes.arrayOf(CoursePageShape.isRequired).isRequired,
  pluginSlotId: PropTypes.string,
  courseId: PropTypes.string,
};

export default injectIntl(PageGrid);
