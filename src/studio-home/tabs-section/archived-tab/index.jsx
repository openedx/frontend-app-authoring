import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, Row} from '@edx/paragon';
import { Error } from  '@edx/paragon/icons';

import CardItem from '../../card-item';
import { sortAlphabeticallyArray } from '../utils';
import AlertMessage from '../../../generic/alert-message';
import messages from '../messages';

const ArchivedTab = ({
  archivedCoursesData,
  isLoading,
  isFailed,
  // injected
  intl,
}) => (
  isLoading ? (
    <LoadingSpinner />
  ) : isFailed ? (
    <AlertMessage
      variant="danger"
      description={(
        <Row className="m-0 align-items-center">
          <Icon src={Error} className="text-danger-500 mr-1" />
          <span>{intl.formatMessage(messages.courseTabErrorMessage)}</span>
        </Row>
      )}
    />
  ) : (
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
  )
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
  isLoading:PropTypes.bool.isRequired,
  isFailed: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ArchivedTab);
