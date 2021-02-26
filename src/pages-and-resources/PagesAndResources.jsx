import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import messages from './messages';
import PageGrid from './pages/PageGrid';
import ResourceList from './resources/ResourcesList';

// XXX this is just for testing and should be removed ASAP
const pages = [
  {
    id: 'discussion',
    title: 'Discussion',
    isEnabled: false,
    showSettings: false,
    showStatus: false,
    showEnable: true,
    description: 'Encourage participation and engagement in your course with discussion forums',
  },
  {
    id: 'teams',
    title: 'Teams',
    isEnabled: true,
    showSettings: true,
    showStatus: true,
    showEnable: false,
    description: 'Leverage teams to allow learners to connect by topic of interest',
  },
  {
    id: 'progress',
    title: 'Progress',
    isEnabled: false,
    showSettings: true,
    showStatus: true,
    showEnable: false,
    description: 'Allow students to track their progress throughout the course lorem ipsum',
  },
  {
    id: 'textbooks',
    title: 'Textbooks',
    isEnabled: true,
    showSettings: true,
    showStatus: true,
    showEnable: false,
    description: 'Provide links to applicable resources for your course',
  },
  {
    id: 'notes',
    title: 'Notes',
    isEnabled: true,
    showSettings: true,
    showStatus: true,
    showEnable: false,
    description: 'Support individual note taking that is visible only to the students',
  },
  {
    id: 'wiki',
    title: 'Wiki',
    isEnabled: false,
    showSettings: false,
    showStatus: false,
    showEnable: true,
    description: 'Share your wiki content to provide additional course material',
  },
];

function PagesAndResources({ courseId, intl }) {
  const { config } = useContext(AppContext);
  const lmsCourseURL = `${config.LMS_BASE_URL}/courses/${courseId}`;
  return (
    <main>
      <div className="container-fluid bg-info-100 pb-3">
        <div className="d-flex justify-content-between align-items-center border-bottom">
          <h1 className="mt-3 text-info-500">{intl.formatMessage(messages.heading)}</h1>
          <a className="btn btn-primary" href={lmsCourseURL} role="button">
            {intl.formatMessage(messages['viewLive.button'])}
          </a>
        </div>
        <PageGrid pages={pages} />
        <ResourceList />
      </div>
    </main>
  );
}

PagesAndResources.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PagesAndResources);
