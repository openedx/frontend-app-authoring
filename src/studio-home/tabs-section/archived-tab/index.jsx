import React from 'react';
import PropTypes from 'prop-types';

import CardItem from '../../card-item';
import { sortAlphabeticallyArray } from '../utils';

const ArchivedTab = ({ archivedCoursesData }) => (
  <div className="courses-tab">
    {sortAlphabeticallyArray(archivedCoursesData).map(({
      courseKey, displayName, lmsLink, org, rerunLink, number, run, url,
    }) => (
      <CardItem
        key={courseKey}
        displayName={displayName}
        lmsLink={lmsLink}
        rerunLink={rerunLink}
        org={org}
        number={number}
        run={run}
        url={url}
      />
    ))}
  </div>
);

ArchivedTab.propTypes = {
  archivedCoursesData: PropTypes.arrayOf(
    PropTypes.shape({
      courseKey: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      lmsLink: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
      org: PropTypes.string.isRequired,
      rerunLink: PropTypes.string.isRequired,
      run: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default ArchivedTab;
