import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge } from '@openedx/paragon';

import ExpandCollapseIconButton from '@src/generic/ExpandCollapseIconButton';
import type { CompetencyTreeNode } from './CompetencyTree';
import messages from './messages';

export interface CompetencyTreeItemProps {
  node: CompetencyTreeNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
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
const CompetencyTreeItem = ({ node, expandedIds, onToggle }: CompetencyTreeItemProps) => {
  const intl = useIntl();
  const nodeId = String(node.id);
  const hasChildren = !!node.subRows?.length;
  const isExpanded = expandedIds.has(nodeId);

  // `externalId` can be `undefined`, `null`, or `''` depending on the data
  // path (the tag-list tree's JSON deep-copy round-trip drops `undefined`
  // keys but keeps `null`, and newly-created tags elsewhere are seeded with
  // `externalId: ''`), so use a truthiness check rather than `!== null`.
  const { externalId } = node;

  return (
    <li className={hasChildren ? 'competency-group' : undefined}>
      <div className="competency-row">
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
        <ul>
          {node.subRows!.map((child) => (
            <CompetencyTreeItem
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CompetencyTreeItem;
