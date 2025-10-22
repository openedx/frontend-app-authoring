import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Card, Icon } from '@openedx/paragon';
import {
  Check,
  Error,
  Folder,
  IncompleteCircle,
  Warning,
} from '@openedx/paragon/icons';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { type CourseMigration } from '../data/api';
import { useLibraryRoutes } from '../routes';
import messages from './messages';

interface MigratedCourseCardProps {
  courseMigration: CourseMigration;
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

const StateIcon = ({ state }: { state: CourseMigration['state'] }) => (
  <Icon
    src={STATE_ICON[state]}
    size="sm"
    className={classNames('mr-2', STATE_ICON_COLOR_CLASS[state])}
  />
);

export const MigratedCourseCard = ({ courseMigration }: MigratedCourseCardProps) => {
  const { navigateTo } = useLibraryRoutes();

  return (
    <Card className={BORDER_CLASS[courseMigration.state]}>
      <Card.Section>
        <Link to={`/course/${courseMigration.source.key}`}>
          <h4>{courseMigration.source.displayName}</h4>
        </Link>
        <div className="d-inline-flex small align-items-center">
          <StateIcon state={courseMigration.state} />
          {courseMigration.state === 'Failed' ? (
            <FormattedMessage {...messages.courseImportTextFailed} />
          ) : (
            <>
              {Math.round(courseMigration.progress * 100)}
              <FormattedMessage {...messages.courseImportTextProgress} />
            </>
          )}
          {courseMigration.targetCollection && (
            <Button
              iconBefore={Folder}
              variant="link"
              className="ml-4"
              onClick={() => navigateTo({ collectionId: courseMigration.targetCollection!.key })}
            >
              {courseMigration.targetCollection.title}
            </Button>
          )}
        </div>
      </Card.Section>
    </Card>
  );
};
