import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';

import { getCourseUnitData } from '../../../data/selectors';
import { editCourseUnitVisibilityAndData } from '../../../data/thunk';
import { PUBLISH_TYPES } from '../../../constants';
import { getVisibilityTitle } from '../../utils';
import messages from '../../messages';

const UnitVisibilityInfo = ({ openVisibleModal, visibleToStaffOnly }) => {
  const intl = useIntl();
  const { blockId } = useParams();
  const dispatch = useDispatch();
  const {
    published,
    hasChanges,
    staffLockFrom,
    releasedToStudents,
    hasExplicitStaffLock,
  } = useSelector(getCourseUnitData);

  const handleCourseUnitVisibility = () => {
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, true));
  };

  return (
    <>
      <small className="course-unit-sidebar-visibility-title">
        {getVisibilityTitle(intl, releasedToStudents, published, hasChanges)}
      </small>
      {visibleToStaffOnly ? (
        <>
          <h6 className="course-unit-sidebar-visibility-copy">
            {intl.formatMessage(messages.visibilityStaffOnlyTitle)}
          </h6>
          {!hasExplicitStaffLock && (
            <span className="course-unit-sidebar-visibility-section mb-2">
              {intl.formatMessage(messages.visibilityHasExplicitStaffLockText, { sectionName: staffLockFrom })}
            </span>
          )}
        </>
      ) : (
        <h6 className="course-unit-sidebar-visibility-copy">
          {intl.formatMessage(messages.visibilityStaffAndLearnersTitle)}
        </h6>
      )}
      <Form.Checkbox
        className="course-unit-sidebar-visibility-checkbox"
        checked={hasExplicitStaffLock}
        onChange={hasExplicitStaffLock ? null : handleCourseUnitVisibility}
        onClick={hasExplicitStaffLock ? openVisibleModal : null}
      >
        {intl.formatMessage(messages.visibilityCheckboxTitle)}
      </Form.Checkbox>
    </>
  );
};

UnitVisibilityInfo.propTypes = {
  openVisibleModal: PropTypes.func.isRequired,
  visibleToStaffOnly: PropTypes.bool.isRequired,
};

export default UnitVisibilityInfo;
