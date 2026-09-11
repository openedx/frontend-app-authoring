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

  // Rendered once and reused, bare, in both the "with selection" and
  // "without selection" paths of each branch below: `CompetencyTree` keeps
  // its own expand/collapse state locally (`expandedIds`), so it must stay
  // at the exact same position in the element tree in both states - moving
  // it in or out of `ResizableBox`/`Col` between states would change its
  // ancestor structure and make React remount it, silently resetting
  // whatever the user had expanded right when they select a competency.
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
      // `gap={3.5}`: Paragon's spacing scale supports half-steps (0, 0.5, 1,
      // ..., 6), each `N * 16px` (this app's root font-size, per
      // `--pgn-spacing-spacer-base: 1rem`) - `3.5` is the exact scale value
      // for the original `20px` gap, not an approximation. Collapsed to `0`
      // before a competency is selected, since there's no second column to
      // put a gap against yet.
      <Stack direction="horizontal" gap={selectedCompetency ? 3.5 : 0} style={{ alignItems: 'stretch' }}>
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
