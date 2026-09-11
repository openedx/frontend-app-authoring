import type { KeyboardEvent } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';

import CompetencyExpandIcon from './CompetencyExpandIcon';
import type { CompetencyTreeNode } from './CompetencyTree';
import messages from './messages';

export interface CompetencyTreeItemProps {
  node: CompetencyTreeNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  selectedCompetencyId?: string | null;
  onSelectCompetency?: (node: CompetencyTreeNode) => void;
}

/** CompetencyTreeItem
 * Recursively renders one node of the competency tree (a group or a
 * sub-competency leaf, and anything nested deeper than that) as an `<li>`:
 * a row (disclosure button + name + Competency ID badge) and, when expanded
 * and the node has children, a nested `<ul>` of more `CompetencyTreeItem`s.
 *
 * Indentation comes from the `<ul>` nesting itself (see `CompetencyTree.scss`),
 * not from a depth number computed here. Whether a node's `<li>` reads
 * visually as a grey "group" envelope (wrapping its own header row and all
 * of its rendered children) or as a plain white leaf "pill" is likewise
 * driven by this same `hasChildren` check, via the `competency-group` class
 * below - not a depth number or a CSS structural-position selector, so it
 * holds recursively at any depth.
 */
const CompetencyTreeItem = ({
  node,
  expandedIds,
  onToggle,
  selectedCompetencyId,
  onSelectCompetency,
}: CompetencyTreeItemProps) => {
  const intl = useIntl();
  const nodeId = String(node.id);
  const hasChildren = !!node.subRows?.length;
  const isExpanded = expandedIds.has(nodeId);

  // `externalId` can be `undefined`, `null`, or `''` depending on the data
  // path (the tag-list tree's JSON deep-copy round-trip drops `undefined`
  // keys but keeps `null`, and newly-created tags elsewhere are seeded with
  // `externalId: ''`), so use a truthiness check rather than `!== null`.
  const { externalId } = node;

  // Every row is selectable, group or leaf, as long as a selection handler was
  // passed down - a group row keeps its own separate expand/collapse control
  // (see `CompetencyExpandIcon`, which stops its click from also reaching this
  // row's own `onClick` below).
  const isSelectable = !!onSelectCompetency;
  const isSelected = isSelectable && selectedCompetencyId != null && nodeId === selectedCompetencyId;

  const handleSelect = () => {
    if (isSelectable && onSelectCompetency) {
      onSelectCompetency(node);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isSelectable && onSelectCompetency && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onSelectCompetency(node);
    }
  };

  return (
    <li className={hasChildren ? 'competency-group' : undefined}>
      <div
        // `role="button"` on this existing row `<div>`, rather than wrapping its
        // icon+label+badge markup in a real `<button>`, which would need its own
        // style reset (Bootstrap's button padding/border/background) to keep the
        // row's current look.
        className={isSelected ? 'competency-row competency-row--selected' : 'competency-row'}
        role={isSelectable ? 'button' : undefined}
        tabIndex={isSelectable ? 0 : undefined}
        aria-selected={isSelectable ? isSelected : undefined}
        aria-label={isSelected
          ? intl.formatMessage(messages.selectedCompetencyAccessibleLabel, { competencyName: node.value })
          : undefined}
        onClick={isSelectable ? handleSelect : undefined}
        onKeyDown={isSelectable ? handleKeyDown : undefined}
      >
        <CompetencyExpandIcon
          canExpand={hasChildren}
          isExpanded={isExpanded}
          onToggle={() => onToggle(nodeId)}
        />
        <span className="competency-row__label">{node.value}</span>
        {externalId ?
          (
            <Badge
              variant="info"
              className="competency-row__badge ml-auto"
              aria-label={intl.formatMessage(messages.competencyIdAccessibleLabel, { externalId })}
            >
              {externalId}
            </Badge>
          ) :
          null}
      </div>
      {isExpanded && hasChildren && (
        <ul>
          {node.subRows!.map((child) => (
            <CompetencyTreeItem
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              selectedCompetencyId={selectedCompetencyId}
              onSelectCompetency={onSelectCompetency}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CompetencyTreeItem;
