import { useState } from 'react';

import { Col, Row, Stack } from '@openedx/paragon';

import { ResizableBox } from '@src/generic/resizable/Resizable';
import { useIsDesktop } from '@src/utils';
import { CompetencyAssociationsProvider } from '../CompetencyAssociationsContext';
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

  // Rendered once and reused in both branches below at the same element-tree
  // position: `CompetencyTree` keeps its own expand/collapse state locally,
  // so moving it between states would make React remount it and silently
  // reset what the user had expanded.
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
      // `gap={3.5}` is Paragon's exact spacing-scale value for the 20px gap
      // (0 before selection, with no second column to gap against).
      // `align-items-stretch` overrides `.pgn__hstack`'s default `center` so
      // columns start flush at the top instead of the shorter one centering.
      <Stack direction="horizontal" gap={selectedCompetency ? 3.5 : 0} className="align-items-stretch">
        <ResizableBox handleSide="right" fullWidth={!selectedCompetency} stretchContent>
          {tree}
        </ResizableBox>
        {selectedCompetency && (
          <div className="flex-grow-1">
            <CompetencyAssociationsProvider
              tagId={Number(selectedCompetency.id)}
              competencyExternalId={selectedCompetency.externalId ?? null}
            >
              <CourseSearchBrowse activeCompetency={selectedCompetency} />
            </CompetencyAssociationsProvider>
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
          <CompetencyAssociationsProvider
            tagId={Number(selectedCompetency.id)}
            competencyExternalId={selectedCompetency.externalId ?? null}
          >
            <CourseSearchBrowse activeCompetency={selectedCompetency} />
          </CompetencyAssociationsProvider>
        </Col>
      )}
    </Row>
  );
};

export default CompetencyAssociationsPanel;
