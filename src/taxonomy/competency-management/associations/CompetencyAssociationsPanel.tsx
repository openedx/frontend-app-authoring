import { useState } from 'react';

import { Col, Row } from '@openedx/paragon';

import { ResizableBox } from '@src/generic/resizable/Resizable';
import { useIsDesktop } from '@src/utils';
import CompetencyTree, { type CompetencyTreeNode } from '../CompetencyTree';
import { CourseSearchBrowse } from '../course-search';

export interface CompetencyAssociationsPanelProps {
  taxonomyId: number;
  taxonomyName: string;
}

/** CompetencyAssociationsPanel
 * Ties the competency tree together with the course search/browse pane: the
 * tree on the left drives which competency is active, and the panel on the
 * right lets the user find and associate courses with it. Selection state
 * lives here so it can be handed to both halves - the tree as
 * `selectedCompetencyId`/`onSelectCompetency`, the course pane as
 * `activeCompetency`.
 */
const CompetencyAssociationsPanel = ({ taxonomyId, taxonomyName }: CompetencyAssociationsPanelProps) => {
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyTreeNode | null>(null);
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className="d-flex" style={{ gap: '20px' }}>
        <ResizableBox handleSide="right">
          <CompetencyTree
            taxonomyId={taxonomyId}
            taxonomyName={taxonomyName}
            selectedCompetencyId={selectedCompetency ? String(selectedCompetency.id) : null}
            onSelectCompetency={setSelectedCompetency}
          />
        </ResizableBox>
        <div className="flex-grow-1">
          <CourseSearchBrowse activeCompetency={selectedCompetency} />
        </div>
      </div>
    );
  }

  return (
    <Row>
      <Col xs={12} lg={4}>
        <CompetencyTree
          taxonomyId={taxonomyId}
          taxonomyName={taxonomyName}
          selectedCompetencyId={selectedCompetency ? String(selectedCompetency.id) : null}
          onSelectCompetency={setSelectedCompetency}
        />
      </Col>
      <Col xs={12} lg={8}>
        <CourseSearchBrowse activeCompetency={selectedCompetency} />
      </Col>
    </Row>
  );
};

export default CompetencyAssociationsPanel;
