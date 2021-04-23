import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('app').attrs({
  featureIds: ['discussion-page', 'embedded-course-sections', 'wcag-2.1'],
  hasFullSupport: false,
  id: 'legacy',
});
