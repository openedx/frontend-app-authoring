import { StrictDict } from '../../utils';

export const LicenseNames = StrictDict({
  select: 'Select',
  allRightsReserved: 'All Rights Reserved',
  creativeCommons: 'Creative Commons',
});

export const LicenseTypes = StrictDict({
  allRightsReserved: 'all-rights-reserved',
  creativeCommons: 'creative-commons',
  select: 'select',
  // publicDomainDedication: 'public-domain-dedication', // future?
});

export const LicenseLevel = StrictDict({
  block: 'block',
  course: 'course',
  library: 'library',
});

export default {
  LicenseLevel,
  LicenseNames,
  LicenseTypes,
};
