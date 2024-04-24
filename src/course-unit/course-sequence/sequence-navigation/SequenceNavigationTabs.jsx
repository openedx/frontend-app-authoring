import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { Plus as PlusIcon, ContentPasteGo as ContentPasteGoIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { changeEditTitleFormOpen, updateQueryPendingStatus } from '../../data/slice';
import { getCourseId, getSequenceId } from '../../data/selectors';
import messages from '../messages';
import { useIndexOfLastVisibleChild } from '../hooks';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import UnitButton from './UnitButton';

const SequenceNavigationTabs = ({
  unitIds, unitId, handleCreateNewCourseXBlock, showPasteUnit,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sequenceId = useSelector(getSequenceId);
  const courseId = useSelector(getCourseId);

  const [
    indexOfLastVisibleChild,
    containerRef,
    invisibleStyle,
  ] = useIndexOfLastVisibleChild();
  const shouldDisplayDropdown = indexOfLastVisibleChild === -1;

  const handleAddNewSequenceUnit = () => {
    dispatch(updateQueryPendingStatus(true));
    handleCreateNewCourseXBlock({ parentLocator: sequenceId, category: 'vertical', displayName: 'Unit' }, ({ courseKey, locator }) => {
      navigate(`/course/${courseKey}/container/${locator}/${sequenceId}`, courseId);
      dispatch(changeEditTitleFormOpen(true));
    });
  };

  const handlePasteNewSequenceUnit = () => {
    dispatch(updateQueryPendingStatus(true));
    handleCreateNewCourseXBlock({ parentLocator: sequenceId, stagedContent: 'clipboard' }, ({ courseKey, locator }) => {
      navigate(`/course/${courseKey}/container/${locator}/${sequenceId}`, courseId);
      dispatch(changeEditTitleFormOpen(true));
    }, unitId);
  };

  return (
    <div className="sequence-navigation-tabs-wrapper">
      <div className="sequence-navigation-tabs-container d-flex" ref={containerRef}>
        <div
          className="sequence-navigation-tabs d-flex flex-grow-1"
          style={shouldDisplayDropdown ? invisibleStyle : null}
        >
          {unitIds.map((buttonUnitId) => (
            <UnitButton
              key={buttonUnitId}
              unitId={buttonUnitId}
              isActive={unitId === buttonUnitId}
            />
          ))}
          <Button
            className="sequence-navigation-tabs-action-btn"
            variant="outline-primary"
            iconBefore={PlusIcon}
            onClick={handleAddNewSequenceUnit}
          >
            {intl.formatMessage(messages.newUnitBtnText)}
          </Button>
          {showPasteUnit && (
            <Button
              className="sequence-navigation-tabs-action-btn"
              variant="outline-primary"
              iconBefore={ContentPasteGoIcon}
              onClick={handlePasteNewSequenceUnit}
            >
              {intl.formatMessage(messages.pasteAsNewUnitLink)}
            </Button>
          )}
        </div>
      </div>
      {shouldDisplayDropdown && (
        <SequenceNavigationDropdown
          unitId={unitId}
          unitIds={unitIds}
          handleAddNewSequenceUnit={handleAddNewSequenceUnit}
          handlePasteNewSequenceUnit={handlePasteNewSequenceUnit}
          showPasteUnit={showPasteUnit}
        />
      )}
    </div>
  );
};

SequenceNavigationTabs.propTypes = {
  unitId: PropTypes.string.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
  showPasteUnit: PropTypes.bool.isRequired,
};

export default SequenceNavigationTabs;
