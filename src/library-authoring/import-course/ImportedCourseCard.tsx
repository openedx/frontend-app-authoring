import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Card,
  Icon,
} from '@openedx/paragon';
import {
  ArrowForwardIos,
  Check,
  Error,
  Folder,
  IncompleteCircle,
  Warning,
} from '@openedx/paragon/icons';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { type CourseImport } from '../data/api';
import { useLibraryRoutes } from '../routes';
import messages from './messages';

interface ImportedCourseCardProps {
  courseImport: CourseImport;
}

const BORDER_CLASS = {
  Succeeded: 'status-border-imported',
  Failed: 'status-border-failed',
  Partial: 'status-border-partial',
  InProgress: 'status-border-in-progress',
};

const STATE_ICON = {
  Succeeded: Check,
  Failed: Error,
  Partial: Warning,
  InProgress: IncompleteCircle,
};

const STATE_ICON_COLOR_CLASS = {
  Succeeded: undefined,
  Failed: 'text-danger-500',
  Partial: 'text-warning-500',
  InProgress: undefined,
};

const StateIcon = ({ state }: { state: CourseImport['state'] }) => (
  <Icon
    src={STATE_ICON[state]}
    size="sm"
    className={classNames('mr-2', STATE_ICON_COLOR_CLASS[state])}
  />
);

export const ImportedCourseCard = ({ courseImport }: ImportedCourseCardProps) => {
  const intl = useIntl();
  const { navigateTo } = useLibraryRoutes();

  return (
    <Card className={BORDER_CLASS[courseImport.state]}>
      <Card.Section className="d-flex flex-row">
        <div>
          <Link to={`/course/${courseImport.source.key}`}>
            <h4>{courseImport.source.displayName}</h4>
          </Link>
          <div className="d-inline-flex small align-items-center">
            <StateIcon state={courseImport.state} />
            {courseImport.state === 'Failed' ? (
              <FormattedMessage {...messages.courseImportTextFailed} />
            ) : (
              <>
                {Math.round(courseImport.progress * 100)}
                <FormattedMessage {...messages.courseImportTextProgress} />
              </>
            )}
            {courseImport.targetCollection && (
              <Button
                iconBefore={Folder}
                variant="link"
                className="ml-4 text-black text-decoration-underline"
                onClick={() => navigateTo({ collectionId: courseImport.targetCollection!.key })}
              >
                {courseImport.targetCollection.title}
              </Button>
            )}
          </div>
        </div>
        <div className="d-flex align-items-center ml-auto">
          <Link
            to={`/course/${courseImport.source.key}`}
            aria-label={intl.formatMessage(messages.courseImportNavigateAlt)}
            className="text-primary-500"
          >
            <Icon src={ArrowForwardIos} />
          </Link>
        </div>
      </Card.Section>
    </Card>
  );
};
