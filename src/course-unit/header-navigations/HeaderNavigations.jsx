import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Edit as EditIcon } from '@openedx/paragon/icons';

import CourseUnitAnalyticsSlot from 'CourseAuthoring/plugin-slots/CourseUnitAnalyticsSlot';
import { COURSE_BLOCK_NAMES } from '../../constants';
import messages from './messages';

const HeaderNavigations = ({
  headerNavigationsActions, category, unitTitle, courseVerticalChildren,
}) => {
  const intl = useIntl();
  const { handleViewLive, handlePreview, handleEdit } = headerNavigationsActions;

  return (
    <nav className="header-navigations ml-auto flex-shrink-0">
      {category === COURSE_BLOCK_NAMES.vertical.id && (
        <>
          <Button
            variant="outline-primary"
            onClick={handleViewLive}
          >
            {intl.formatMessage(messages.viewLiveButton)}
          </Button>
          <Button
            variant="outline-primary"
            onClick={handlePreview}
          >
            {intl.formatMessage(messages.previewButton)}
          </Button>
        </>
      )}
      {[COURSE_BLOCK_NAMES.libraryContent.id, COURSE_BLOCK_NAMES.splitTest.id].includes(category) && (
        <Button
          iconBefore={EditIcon}
          variant="outline-primary"
          onClick={handleEdit}
          data-testid="header-edit-button"
        >
          {intl.formatMessage(messages.editButton)}
        </Button>
      )}
      <CourseUnitAnalyticsSlot
        unitTitle={unitTitle}
        isUnitVerticalType={category === COURSE_BLOCK_NAMES.vertical.id}
        courseVerticalChildren={courseVerticalChildren}
      />
    </nav>
  );
};

HeaderNavigations.propTypes = {
  headerNavigationsActions: PropTypes.shape({
    handleViewLive: PropTypes.func.isRequired,
    handlePreview: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
  }).isRequired,
  unitTitle: PropTypes.string.isRequired,
  courseVerticalChildren: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      blockId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      blockType: PropTypes.string.isRequired,
    }),
  ).isRequired,
  category: PropTypes.string.isRequired,
};

export default HeaderNavigations;
