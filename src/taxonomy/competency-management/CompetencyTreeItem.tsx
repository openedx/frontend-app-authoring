import type { KeyboardEvent } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';

import ExpandCollapseIconButton from '@src/generic/ExpandCollapseIconButton';
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

  // Whether the tree is in "selection mode" at all - i.e. a selection handler
  // was passed down. This gates the ARIA tree-structural roles below
  // (`treeitem`/`group`/`none`), independently of whether *this particular*
  // node can itself be selected, so a non-selectable group row still parents
  // its selectable leaf descendants correctly in the accessibility tree.
  const isSelectionEnabled = !!onSelectCompetency;
  // Only a leaf competency is selectable - a bottom-tier or higher group
  // node is expand/collapse-only, matching the CBE model where a parent
  // competency's mastery rolls up from its children rather than being
  // directly associated. A group row keeps its own separate expand/collapse
  // control regardless (see `ExpandCollapseIconButton`, which stops its
  // click and keydown from also reaching this row's own `onClick`/
  // `onKeyDown` below).
  const isSelectable = isSelectionEnabled && !hasChildren;
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
    // `role="none"` removes this `<li>` from the accessibility tree when it
    // wraps a `treeitem` below: axe's `aria-required-parent`/`listitem`
    // rules require a `treeitem` to be a direct accessibility-tree child of
    // its `tree`/`group` container, which a plain (implicit `listitem`)
    // `<li>` in between breaks - confirmed live via `axe-core`. Gated on
    // `isSelectionEnabled` (not `isSelectable`): a non-selectable group row
    // still wraps a `treeitem` below (its own row, structurally) and its
    // selectable leaf descendants, so it needs this too, even though it
    // isn't itself a selection target.
    <li className={hasChildren ? 'competency-group' : undefined} role={isSelectionEnabled ? 'none' : undefined}>
      <div
        // `role="treeitem"` (part of the `role="tree"`/`"group"` structure -
        // see `CompetencyTree.tsx` and the nested `<ul>` below) allows
        // `aria-selected` directly, unlike `role="button"`, and axe's
        // `nested-interactive` rule (which flagged the disclosure `<button>`
        // below when this row was `role="button"`) doesn't apply to
        // `treeitem`. Also gated on `isSelectionEnabled`, not `isSelectable`:
        // a group row is still a `treeitem` in the tree (just one that only
        // expands/collapses, never selects) - dropping the role entirely for
        // group rows would leave their selectable leaf descendants without a
        // valid `treeitem`/`group` ancestor chain. `aria-selected` itself
        // (below) stays leaf-only, since that's the actual selection state.
        className={isSelected ? 'competency-row competency-row--selected' : 'competency-row'}
        role={isSelectionEnabled ? 'treeitem' : undefined}
        tabIndex={isSelectable ? 0 : undefined}
        aria-selected={isSelectable ? isSelected : undefined}
        onClick={isSelectable ? handleSelect : undefined}
        onKeyDown={isSelectable ? handleKeyDown : undefined}
      >
        <ExpandCollapseIconButton
          canExpand={hasChildren}
          isExpanded={isExpanded}
          onToggle={() => onToggle(nodeId)}
          expandLabel={intl.formatMessage(messages.expandRowButtonLabel)}
          collapseLabel={intl.formatMessage(messages.collapseRowButtonLabel)}
        />
        <span className="competency-row__label">{node.value}</span>
        {externalId ?
          (
            <>
              <span className="sr-only">
                {intl.formatMessage(messages.competencyIdAccessibleLabel, { externalId })}
              </span>
              <Badge
                variant="info"
                className="competency-row__badge ml-auto"
                aria-hidden="true"
              >
                {externalId}
              </Badge>
            </>
          ) :
          null}
      </div>
      {isExpanded && hasChildren && (
        <ul role={isSelectionEnabled ? 'group' : undefined}>
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
