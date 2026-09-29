import { useIntl } from '@edx/frontend-platform/i18n';

import { CourseGroupList } from '../criteria-groups';
import messages from './messages';

export interface CriteriaAssociationsSectionProps {
  /** The currently selected competency's name, shown in the "Demonstrate
   * Mastery For" line.
   */
  competencyName: string;
}

/** The associations section above "Courses & Content": the selected
 * competency's existing criteria groups, rendered as a tree of course-level
 * groups, bottom-tier groups, and rule boxes.
 *
 * `CourseGroupList` reads its own data and focus state from
 * `CompetencyAssociationsContext`; this component only renders the static
 * label/mastery lines, which need `competencyName` directly since the
 * context doesn't track it.
 */
const CriteriaAssociationsSection = ({ competencyName }: CriteriaAssociationsSectionProps) => {
  const intl = useIntl();

  return (
    <div className="course-search-browse__associations">
      <div className="course-search-browse__associations-label">
        {intl.formatMessage(messages.associationsSectionLabel)}
      </div>
      <div className="course-search-browse__associations-mastery">
        {intl.formatMessage(messages.demonstrateMasteryForLabel, { competencyName })}
      </div>
      <CourseGroupList />
    </div>
  );
};

export default CriteriaAssociationsSection;
