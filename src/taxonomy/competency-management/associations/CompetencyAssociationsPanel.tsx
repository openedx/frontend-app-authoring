import { useState } from 'react';
import { createPortal } from 'react-dom';

import { Col, Row, Stack } from '@openedx/paragon';
import classNames from 'classnames';

import { ResizableBox } from '@src/generic/resizable/Resizable';
import { useIsDesktop } from '@src/utils';
import { CompetencyAssociationsProvider } from '../CompetencyAssociationsContext';
import CompetencyTree, { type CompetencyTreeNode } from '../CompetencyTree';
import { CourseSearchBrowse } from '../course-search';
import './CompetencyAssociationsPanel.scss';

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
  const [courseColumn, setCourseColumn] = useState<HTMLElement | null>(null);
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

  const layout = isDesktop
    ? (
      // `gap={3.5}` is Paragon's exact spacing-scale value for the 20px gap
      // (0 before selection, with no second column to gap against).
      // `align-items-stretch` overrides `.pgn__hstack`'s default `center` so
      // columns start flush at the top instead of the shorter one centering.
      <Stack
        direction="horizontal"
        gap={selectedCompetency ? 3.5 : 0}
        className={classNames('competency-associations-panel align-items-stretch', {
          'competency-associations-panel--with-courses': selectedCompetency,
        })}
      >
        <ResizableBox handleSide="right" fullWidth={!selectedCompetency} stretchContent>
          {tree}
        </ResizableBox>
        {selectedCompetency && (
          <div ref={setCourseColumn} className="flex-grow-1 competency-associations__course-column" />
        )}
      </Stack>
    )
    : (
      <Row>
        <Col xs={12} lg={selectedCompetency ? 4 : 12}>
          {tree}
        </Col>
        {selectedCompetency && <Col ref={setCourseColumn} xs={12} lg={8} />}
      </Row>
    );

  // One provider outside both layouts keeps its state across a breakpoint change. The portal fills whichever
  // layout's course column is mounted.
  return (
    <>
      {layout}
      {selectedCompetency && (
        <CompetencyAssociationsProvider
          tagId={Number(selectedCompetency.id)}
          competencyName={selectedCompetency.value}
          competencyExternalId={selectedCompetency.externalId ?? null}
        >
          {courseColumn && createPortal(<CourseSearchBrowse activeCompetency={selectedCompetency} />, courseColumn)}
        </CompetencyAssociationsProvider>
      )}
    </>
  );
};

export default CompetencyAssociationsPanel;
