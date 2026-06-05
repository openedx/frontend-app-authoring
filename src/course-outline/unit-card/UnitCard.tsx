import type { OutlineActionSelection, UnitXBlock, XBlock } from '@src/data/types';
import OutlineNode from '../OutlineNode';

export interface UnitCardProps {
  unit: UnitXBlock;
  subsection: XBlock;
  section: XBlock;
  onOpenConfigureModal: (selection: OutlineActionSelection) => void;
  onOpenDeleteModal: (selection: OutlineActionSelection) => void;
  index: number;
  getPossibleMoves: (index: number, step: number) => void;
  onOrderChange: (section: XBlock, moveDetails: any) => void;
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  discussionsSettings: {
    providerType: string;
    enableGradedUnits: boolean;
  };
}

const UnitCard = ({
  unit,
  subsection,
  section,
  isSelfPaced,
  isCustomRelativeDatesActive,
  index,
  getPossibleMoves,
  onOpenConfigureModal,
  onOpenDeleteModal,
  onOrderChange,
  discussionsSettings,
}: UnitCardProps) => (
  <OutlineNode
    block={unit as unknown as XBlock}
    depth={2}
    index={index}
    isSelfPaced={isSelfPaced}
    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
    isSectionsExpanded={false}
    onOpenConfigureModal={onOpenConfigureModal}
    onOpenDeleteModal={onOpenDeleteModal}
    getPossibleMoves={getPossibleMoves}
    onOrderChange={onOrderChange}
    section={section}
    subsection={subsection}
    discussionsSettings={discussionsSettings}
    testId="unit-card"
    headerTestId="unit-card-header"
  />
);

export default UnitCard;
