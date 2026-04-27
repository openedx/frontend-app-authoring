import PropTypes from 'prop-types';
import React from 'react';
import { CardGrid } from '@openedx/paragon';
import PageCard, { CoursePageShape } from './PageCard';

const PageGrid = ({ pages, pluginSlotComponent, courseId, readOnly = false }) => (
  <CardGrid
    columnSizes={{
      xs: 12,
      sm: 6,
      lg: 6,
      xl: 6,
    }}
  >
    {pages.map((page) => <PageCard page={page} key={page.id} courseId={courseId} readOnly={readOnly} />)}
    {pluginSlotComponent}
  </CardGrid>
);

PageGrid.defaultProps = {
  pluginSlotComponent: null,
  courseId: null,
  readOnly: false,
};

PageGrid.propTypes = {
  pages: PropTypes.arrayOf(CoursePageShape.isRequired).isRequired,
  pluginSlotComponent: PropTypes.element,
  courseId: PropTypes.string,
  readOnly: PropTypes.bool,
};

export default PageGrid;
