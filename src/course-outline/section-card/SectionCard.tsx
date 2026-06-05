import { type ReactNode } from 'react';
import type { OutlineActionSelection, XBlock } from '@src/data/types';
import OutlineNode from '../OutlineNode';

export interface SectionCardProps {
  section: XBlock;
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  children: ReactNode;
  onOpenHighlightsModal: (section: XBlock) => void;
  onOpenConfigureModal: (selection: OutlineActionSelection) => void;
  onOpenDeleteModal: (selection: OutlineActionSelection) => void;
  isSectionsExpanded: boolean;
  index: number;
  canMoveItem: (oldIndex: number, newIndex: number) => boolean;
  onOrderChange: (oldIndex: number, newIndex: number) => void;
}

const SectionCard = ({
  section,
  isSelfPaced,
  isCustomRelativeDatesActive,
  children,
  index,
  canMoveItem,
  onOpenHighlightsModal,
  onOpenConfigureModal,
  onOpenDeleteModal,
  isSectionsExpanded,
  onOrderChange,
}: SectionCardProps) => (
  <OutlineNode
    block={section}
    depth={0}
    index={index}
    isSelfPaced={isSelfPaced}
    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
    isSectionsExpanded={isSectionsExpanded}
    onOpenConfigureModal={onOpenConfigureModal}
    onOpenDeleteModal={onOpenDeleteModal}
    onOpenHighlightsModal={onOpenHighlightsModal}
    canMoveItem={canMoveItem}
    onOrderChange={(_block, details) => onOrderChange(details.oldIndex, details.newIndex)}
    section={section}
    testId="section-card"
    headerTestId="section-card-header"
  >
    {children}
  </OutlineNode>
);

export default SectionCard;
