import PropTypes from 'prop-types';
import React from 'react';
import { CardGrid } from '@openedx/paragon';
import PageCard, { CoursePageShape } from './PageCard';

const PageGrid = ({ pages, pluginSlotComponent, courseId }) => (
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
    {pluginSlotComponent}
  </CardGrid>
);

PageGrid.defaultProps = {
  pluginSlotComponent: null,
  courseId: null,
};

PageGrid.propTypes = {
  pages: PropTypes.arrayOf(CoursePageShape.isRequired).isRequired,
  pluginSlotComponent: PropTypes.element,
  courseId: PropTypes.string,
};

export default PageGrid;
