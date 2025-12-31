import { useDispatch, useSelector } from 'react-redux';
import { Form } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';

import { getCourseUnitData } from '@src/course-unit/data/selectors';
import { editCourseUnitVisibilityAndData } from '@src/course-unit/data/thunk';
import { PUBLISH_TYPES } from '@src/course-unit/constants';
import messages from '../../messages';

interface UnitVisibilityInfoProps {
  openVisibleModal: () => void,
  visibleToStaffOnly: boolean,
}

const UnitVisibilityInfo = ({
  openVisibleModal,
  visibleToStaffOnly,
}: UnitVisibilityInfoProps) => {
  const { blockId } = useParams();
  const dispatch = useDispatch();
  const {
    staffLockFrom,
    hasExplicitStaffLock,
  } = useSelector(getCourseUnitData);

  const handleCourseUnitVisibility = () => {
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, true));
  };

  return (
    <>
      <small className="course-unit-sidebar-visibility-title">
        <FormattedMessage {...messages.visibilityVisibleToTitle} />
      </small>
      {visibleToStaffOnly ? (
        <>
          <h6 className="course-unit-sidebar-visibility-copy">
            <FormattedMessage {...messages.visibilityStaffOnlyTitle} />
          </h6>
          {!hasExplicitStaffLock && (
            <span className="course-unit-sidebar-visibility-section mb-2">
              <FormattedMessage
                {...messages.visibilityHasExplicitStaffLockText}
                values={{ sectionName: staffLockFrom }}
              />
            </span>
          )}
        </>
      ) : (
        <h6 className="course-unit-sidebar-visibility-copy">
          <FormattedMessage {...messages.visibilityStaffAndLearnersTitle} />
        </h6>
      )}
      <Form.Checkbox
        className="course-unit-sidebar-visibility-checkbox"
        checked={hasExplicitStaffLock}
        onChange={hasExplicitStaffLock ? null : handleCourseUnitVisibility}
        onClick={hasExplicitStaffLock ? openVisibleModal : null}
      >
        <FormattedMessage {...messages.visibilityCheckboxTitle} />
      </Form.Checkbox>
    </>
  );
};

export default UnitVisibilityInfo;
