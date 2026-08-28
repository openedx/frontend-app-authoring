import { useMemo, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { OpenInFull } from '@openedx/paragon/icons';

import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import { LoadingSpinner } from '@src/generic/Loading';
import { useTagListData } from '@src/taxonomy/data/apiHooks';
import { TagTree } from '@src/taxonomy/tag-list/tagTree';
import CompetencyExpandIcon from './CompetencyExpandIcon';
import CompetencyTreeItem from './CompetencyTreeItem';
import messages from './messages';
// @ts-ignore
import './CompetencyTree.scss';

interface CompetencyTreeProps {
  taxonomyId: number;
  taxonomyName: string;
}

/** A single node of this page's tree: either a real tag (from `TagTree`) or
 * the synthetic taxonomy-root node this component wraps it in. Narrower than
 * `TagTreeNode`/`TagData` since this page only ever reads `id`, `value`,
 * `externalId`, and `subRows`.
 */
export interface CompetencyTreeNode {
  id: string | number;
  value: string;
  externalId?: string | null;
  subRows?: CompetencyTreeNode[];
}

const ROOT_ID = 'taxonomy-root';

/** Either the successfully-built tree, or a marker that building it failed. */
type TreeBuildResult = { treeData: CompetencyTreeNode[]; } | { treeBuildError: true; };

/** Collects the string ids of every node (including the root passed in)
 * that has at least one child, i.e. every node that can be expanded.
 */
function collectExpandableIds(node: CompetencyTreeNode): string[] {
  if (!node.subRows?.length) {
    return [];
  }
  return [
    String(node.id),
    ...node.subRows.flatMap(collectExpandableIds),
  ];
}

const CompetencyTree = ({ taxonomyId, taxonomyName }: CompetencyTreeProps) => {
  const intl = useIntl();
  const { isLoading, data: tagList } = useTagListData(taxonomyId, {
    pageIndex: 0,
    pageSize: 50,
    disablePagination: true,
    enabled: true,
  });

  // Showing just the root row, collapsed, is this page's deliberate initial
  // state - not a framework default. Nothing else needs to be expanded for
  // the page to make sense on first load.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const treeBuildResult = useMemo((): TreeBuildResult => {
    if (!tagList?.results) {
      return { treeData: [] };
    }
    try {
      return { treeData: new TagTree(tagList.results).getAllAsDeepCopy() as unknown as CompetencyTreeNode[] };
    } catch {
      // `TagTree`'s constructor throws `TagTreeError` on duplicate tag values or a
      // cycle in the data. `TaxonomyLayout` has no error boundary, so an uncaught
      // throw here would break the whole page; render a connection-error state instead.
      return { treeBuildError: true };
    }
  }, [tagList?.results]);

  // The taxonomy itself is the tree's root row, one level above the tags
  // returned by the API: the ticket's acceptance criteria calls for a nested
  // tree of "root, groups, sub-competencies", where "root" is the taxonomy's
  // own name, not just its starting point in the breadcrumb above the tree.
  // This node is a display-only construct - it's never part of `TagData`/the
  // API response, and nothing here writes it back.
  const rootNode: CompetencyTreeNode | null = 'treeBuildError' in treeBuildResult
    ? null
    : { id: ROOT_ID, value: taxonomyName, subRows: treeBuildResult.treeData };

  const allExpandableIds = useMemo(
    () => (rootNode ? collectExpandableIds(rootNode) : []),
    [rootNode],
  );

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllExpanded = allExpandableIds.length > 0
    && allExpandableIds.every((id) => expandedIds.has(id));

  const handleToggleAll = () => {
    setExpandedIds(isAllExpanded ? new Set() : new Set(allExpandableIds));
  };

  if ('treeBuildError' in treeBuildResult || !rootNode) {
    return <ConnectionErrorAlert />;
  }

  const rootHasChildren = !!rootNode.subRows?.length;
  const rootIsExpanded = expandedIds.has(ROOT_ID);

  return (
    <div className="competency-tree">
      <div className="competency-tree__toolbar d-flex justify-content-end align-items-center">
        <Button
          variant="outline-primary"
          iconBefore={OpenInFull}
          onClick={handleToggleAll}
          aria-pressed={isAllExpanded}
          className="competency-tree__toggle-button"
        >
          {isAllExpanded
            ? intl.formatMessage(messages.collapseAll)
            : intl.formatMessage(messages.expandAll)}
        </Button>
      </div>
      {isLoading ?
        (
          <div className="competency-tree__container d-flex justify-content-center p-4">
            <LoadingSpinner />
          </div>
        ) :
        (
          <div className="competency-tree__container">
            <div className="competency-row competency-row--root">
              <CompetencyExpandIcon
                canExpand={rootHasChildren}
                isExpanded={rootIsExpanded}
                onToggle={() => handleToggle(ROOT_ID)}
              />
              <span className="competency-row__label">{taxonomyName}</span>
            </div>
            {rootIsExpanded && rootHasChildren && (
              <ul>
                {rootNode.subRows!.map((group) => (
                  <CompetencyTreeItem
                    key={group.id}
                    node={group}
                    expandedIds={expandedIds}
                    onToggle={handleToggle}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
    </div>
  );
};

export default CompetencyTree;
