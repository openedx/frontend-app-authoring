import { type ReactNode } from 'react';
import type { OutlineActionSelection, XBlock } from '@src/data/types';
import OutlineNode from '../OutlineNode';

export interface SubsectionCardProps {
  section: XBlock;
  subsection: XBlock;
  children: ReactNode;
  isSectionsExpanded: boolean;
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  onOpenDeleteModal: (selection: OutlineActionSelection) => void;
  index: number;
  getPossibleMoves: (index: number, step: number) => any;
  onOrderChange: (section: XBlock, moveDetails: any) => void;
  onOpenConfigureModal: (selection: OutlineActionSelection) => void;
  onPasteClick: (
    parentLocator: string,
    subsectionId: string,
    sectionId: string,
  ) => void;
}

const SubsectionCard = ({
  section,
  subsection,
  children,
  isSectionsExpanded,
  isSelfPaced,
  isCustomRelativeDatesActive,
  index,
  getPossibleMoves,
  onOpenDeleteModal,
  onOrderChange,
  onOpenConfigureModal,
  onPasteClick,
}: SubsectionCardProps) => (
  <OutlineNode
    block={subsection}
    depth={1}
    index={index}
    isSelfPaced={isSelfPaced}
    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
    isSectionsExpanded={isSectionsExpanded}
    onOpenConfigureModal={onOpenConfigureModal}
    onOpenDeleteModal={onOpenDeleteModal}
    getPossibleMoves={getPossibleMoves}
    onOrderChange={onOrderChange}
    onPasteClick={onPasteClick}
    section={section}
    testId="subsection-card"
    headerTestId="subsection-card-header"
  >
    {children}
  </OutlineNode>
);

export default SubsectionCard;
