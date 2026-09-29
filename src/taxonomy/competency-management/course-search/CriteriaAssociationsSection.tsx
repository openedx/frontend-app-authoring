import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';

import type { CompetencyTreeNode } from '../CompetencyTree';
import { CourseGroupList } from '../criteria-groups';
import messages from './messages';

export interface CriteriaAssociationsSectionProps {
  /** The currently selected competency, named in the "Demonstrate Mastery
   * For" line along with its Competency ID badge.
   */
  competency: CompetencyTreeNode;
}

/** The associations section above "Courses & Content": the selected
 * competency's existing criteria groups, rendered as a tree of course-level
 * groups, bottom-tier groups, and rule boxes.
 *
 * `CourseGroupList` reads its own data and focus state from
 * `CompetencyAssociationsContext`; this component only renders the static
 * label/mastery lines, which need `competency` directly since the context
 * doesn't track its name.
 */
const CriteriaAssociationsSection = ({ competency }: CriteriaAssociationsSectionProps) => {
  const intl = useIntl();

  return (
    <div className="course-search-browse__associations">
      <div className="course-search-browse__associations-label">
        {intl.formatMessage(messages.associationsSectionLabel)}
      </div>
      <div className="course-search-browse__associations-mastery">
        {intl.formatMessage(messages.demonstrateMasteryForLabel, {
          competencyName: <strong>{competency.value}</strong>,
        })}
        {competency.externalId && (
          <>
            <span className="sr-only">
              {intl.formatMessage(messages.competencyIdAccessibleLabel, {
                externalId: competency.externalId,
              })}
            </span>
            <Badge variant="info" className="competency-row__badge ml-2" aria-hidden="true">
              {competency.externalId}
            </Badge>
          </>
        )}
      </div>
      <CourseGroupList />
    </div>
  );
};

export default CriteriaAssociationsSection;
