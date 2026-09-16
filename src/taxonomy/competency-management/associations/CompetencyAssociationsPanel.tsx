import { useState } from 'react';

import { Col, Row, Stack } from '@openedx/paragon';

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

  // Rendered once and reused, bare, in both branches below: `CompetencyTree`
  // keeps its own expand/collapse state locally, so moving it to a different
  // position in the element tree between states would remount it and reset
  // that state.
  const tree = (
    <CompetencyTree
      taxonomyId={taxonomyId}
      taxonomyName={taxonomyName}
      selectedCompetencyId={selectedCompetency ? String(selectedCompetency.id) : null}
      onSelectCompetency={setSelectedCompetency}
    />
  );

  if (isDesktop) {
    return (
      // `gap={3.5}` is Paragon's spacing-scale value for the original 20px
      // gap (each step is `N * 16px`), collapsed to `0` before a competency
      // is selected since there's no second column to put a gap against yet.
      // `align-items-stretch` overrides `.pgn__hstack`'s default `center`, so
      // the two columns start flush at the top instead of the shorter one
      // being vertically centered against the taller.
      <Stack direction="horizontal" gap={selectedCompetency ? 3.5 : 0} className="align-items-stretch">
        <ResizableBox handleSide="right" fullWidth={!selectedCompetency}>
          {tree}
        </ResizableBox>
        {selectedCompetency && (
          <div className="flex-grow-1">
            <CourseSearchBrowse activeCompetency={selectedCompetency} />
          </div>
        )}
      </Stack>
    );
  }

  return (
    <Row>
      <Col xs={12} lg={selectedCompetency ? 4 : 12}>
        {tree}
      </Col>
      {selectedCompetency && (
        <Col xs={12} lg={8}>
          <CourseSearchBrowse activeCompetency={selectedCompetency} />
        </Col>
      )}
    </Row>
  );
};

export default CompetencyAssociationsPanel;
