import React from 'react';
import { Card, Stack } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const SplitTestSidebarInfo = () => {
  const intl = useIntl();
  const boldTagWrapper = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

  return (
    <Card.Body className="course-split-test-sidebar">
      <Stack>
        <h3 className="course-split-test-sidebar-title">
          {intl.formatMessage(messages.sidebarSplitTestAddComponentTitle)}
        </h3>
        <p>
          {intl.formatMessage(messages.sidebarSplitTestSelectComponentType, { bold_tag: boldTagWrapper })}
        </p>
        <p>
          {intl.formatMessage(messages.sidebarSplitTestComponentAdded)}
        </p>
        <h3 className="course-split-test-sidebar-title">
          {intl.formatMessage(messages.sidebarSplitTestEditComponentTitle)}
        </h3>
        <p>
          {intl.formatMessage(messages.sidebarSplitTestEditComponentInstruction, { bold_tag: boldTagWrapper })}
        </p>
        <h3 className="course-split-test-sidebar-title">
          {intl.formatMessage(messages.sidebarSplitTestReorganizeComponentTitle)}
        </h3>
        <p>
          {intl.formatMessage(messages.sidebarSplitTestReorganizeComponentInstruction)}
        </p>
        <p>
          {intl.formatMessage(messages.sidebarSplitTestReorganizeGroupsInstruction)}
        </p>
        <h3 className="course-split-test-sidebar-title">
          {intl.formatMessage(messages.sidebarSplitTestExperimentComponentTitle)}
        </h3>
        <p className="mb-0">
          {intl.formatMessage(messages.sidebarSplitTestExperimentComponentInstruction)}
        </p>
        <hr className="course-split-test-sidebar-devider my-4" />
        <Link
          to="https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/developing_course/course_components.html#components-that-contain-other-components"
          className="btn btn-outline-primary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {intl.formatMessage(messages.sidebarSplitTestLearnMoreLinkLabel)}
        </Link>
      </Stack>
    </Card.Body>
  );
};

SplitTestSidebarInfo.propTypes = {};

export default SplitTestSidebarInfo;
