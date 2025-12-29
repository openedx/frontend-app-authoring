import { PluginSlot } from '@openedx/frontend-plugin-framework';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';

interface CourseUnitPublishButtonSlotProps {
  courseRole: 'staff' | 'instructor' | null;
  published: boolean;
  hasChanges: boolean;
  publishButtonText: string;
  onPublish: () => void;
}

const CourseUnitPublishButtonSlot = ({
  courseRole,
  published,
  hasChanges,
  publishButtonText,
  onPublish,
}: CourseUnitPublishButtonSlotProps) => {
  if (!(!published || hasChanges)) {
    return null;
  }

  const shouldHideByDefault = courseRole === 'staff' || courseRole === null;

  const defaultComponent = (
    <Button
      size="sm"
      className="mt-3.5"
      variant="outline-primary"
      onClick={onPublish}
      style={{ display: shouldHideByDefault ? 'none' : undefined }}
    >
      {publishButtonText}
    </Button>
  );

  return (
    <PluginSlot
      id="org.openedx.frontend.authoring.course_unit_publish_button.v1"
      idAliases={['course_unit_publish_button_slot']}
      pluginProps={{
        courseRole: courseRole ?? null,
        published: published ?? false,
        hasChanges: hasChanges ?? false,
        publishButtonText: publishButtonText ?? 'Publish',
        onPublish: onPublish ?? (() => {}),
      }}
    >
      {defaultComponent}
    </PluginSlot>
  );
};

CourseUnitPublishButtonSlot.propTypes = {
  courseRole: PropTypes.oneOf(['staff', 'instructor', null]),
  published: PropTypes.bool.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  publishButtonText: PropTypes.string.isRequired,
  onPublish: PropTypes.func.isRequired,
};

export default CourseUnitPublishButtonSlot;

