import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  injectIntl, intlShape, isRtl, getLocale,
} from '@edx/frontend-platform/i18n';
import { Button, useWindowSize, breakpoints } from '@openedx/paragon';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@openedx/paragon/icons';

import { useModel } from '../../../generic/model-store';
import { RequestStatus } from '../../../data/constants';
import { getSequenceStatus } from '../../data/selectors';
import { useSequenceNavigationMetadata } from '../hooks';
import messages from '../messages';
import SequenceNavigationTabs from './SequenceNavigationTabs';

const SequenceNavigation = ({
  intl,
  courseId,
  unitId,
  sequenceId,
  className,
  handleCreateNewCourseXBlock,
  showPasteUnit,
}) => {
  const sequenceStatus = useSelector(getSequenceStatus);
  const {
    isFirstUnit, isLastUnit, nextLink, previousLink,
  } = useSequenceNavigationMetadata(courseId, sequenceId, unitId);
  const sequence = useModel('sequences', sequenceId);

  const shouldDisplayNotificationTriggerInSequence = useWindowSize().width < breakpoints.small.minWidth;
  const renderUnitButtons = () => {
    if (sequence.unitIds?.length === 0 || unitId === null) {
      return (
        <div style={{ flexBasis: '100%', minWidth: 0, borderBottom: 'solid 1px #EAEAEA' }} />
      );
    }

    return (
      <SequenceNavigationTabs
        unitIds={sequence.unitIds || []}
        unitId={unitId}
        handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
        showPasteUnit={showPasteUnit}
      />
    );
  };

  const renderPreviousButton = () => {
    const buttonText = intl.formatMessage(messages.prevBtnText);
    const prevArrow = isRtl(getLocale()) ? ChevronRightIcon : ChevronLeftIcon;

    if (!isFirstUnit) {
      return (
        <Button
          className="sequence-navigation-prev-btn"
          variant="outline-primary"
          iconBefore={prevArrow}
          as={Link}
          to={previousLink}
        >
          {shouldDisplayNotificationTriggerInSequence ? null : buttonText}
        </Button>
      );
    }

    return null;
  };

  const renderNextButton = () => {
    const buttonText = intl.formatMessage(messages.nextBtnText);
    const nextArrow = isRtl(getLocale()) ? ChevronLeftIcon : ChevronRightIcon;

    if (!isLastUnit) {
      return (
        <Button
          className="sequence-navigation-next-btn"
          variant="outline-primary"
          iconAfter={nextArrow}
          as={Link}
          to={nextLink}
        >
          {shouldDisplayNotificationTriggerInSequence ? null : buttonText}
        </Button>
      );
    }

    return null;
  };

  return sequenceStatus === RequestStatus.SUCCESSFUL && (
    <nav
      className={classNames('sequence-navigation d-flex', className)}
      style={{ width: shouldDisplayNotificationTriggerInSequence ? '90%' : null }}
    >
      {renderPreviousButton()}
      {renderUnitButtons()}
      {renderNextButton()}
    </nav>
  );
};

SequenceNavigation.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  sequenceId: PropTypes.string,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
  showPasteUnit: PropTypes.bool.isRequired,
};

SequenceNavigation.defaultProps = {
  sequenceId: null,
  unitId: null,
  className: undefined,
};

export default injectIntl(SequenceNavigation);
