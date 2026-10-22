import type { FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge, Overlay, Tooltip } from '@openedx/paragon';

import ExpandCollapseIconButton from '@src/generic/ExpandCollapseIconButton';
import type { CompetencyTreeNode } from './CompetencyTree';
import messages from './messages';

// Lets the pointer travel from the row onto its tooltip (WCAG 1.4.13, hoverable).
const TOOLTIP_HIDE_DELAY_MS = 100;

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
 * visually as a "group" envelope (wrapping its own header row and all
 * of its rendered children) or as a leaf "pill" is likewise
 * driven by this same `hasChildren` check, via the `competency-group` class
 * below - not a depth number or a CSS structural-position selector, so it
 * holds recursively at any depth.
 *
 * Because a group's nested `<ul>` lives inside the group's own `<li>`, the
 * `<li role="treeitem">` is given an explicit `aria-labelledby` pointing at
 * its own row. Without it, the treeitem's accessible name would be computed
 * from its entire subtree's text content, so focusing a top-level group would
 * announce every descendant's name and Competency ID along with it.
 */
const CompetencyTreeItem = ({
  node,
  expandedIds,
  onToggle,
  selectedCompetencyId,
  onSelectCompetency,
}: CompetencyTreeItemProps) => {
  const intl = useIntl();
  const labelId = useId();
  const externalIdLabelId = useId();
  const tooltipId = useId();
  const rowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showTooltip, setShowTooltip] = useState(false);
  const nodeId = String(node.id);
  const hasChildren = !!node.subRows?.length;
  const isExpanded = expandedIds.has(nodeId);

  // `externalId` can be `undefined`, `null`, or `''` depending on the data
  // path (the tag-list tree's JSON deep-copy round-trip drops `undefined`
  // keys but keeps `null`, and newly-created tags elsewhere are seeded with
  // `externalId: ''`), so use a truthiness check rather than `!== null`.
  const { externalId } = node;

  // Every node is selectable, group or leaf, as long as a selection handler was
  // passed down - a group keeps its own separate expand/collapse control
  // (see `ExpandCollapseIconButton`, which stops its click and keydown from
  // also reaching this node's own `onClick`/`onKeyDown` below).
  const isSelectable = !!onSelectCompetency;
  const isSelected = isSelectable && selectedCompetencyId != null && nodeId === selectedCompetencyId;

  const labelledBy = externalId ? `${labelId} ${externalIdLabelId}` : labelId;

  const handleSelect = (event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) => {
    if (isSelectable && onSelectCompetency) {
      event.stopPropagation();
      onSelectCompetency(node);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(event);
    }
  };

  const cancelHide = () => clearTimeout(hideTimer.current);
  const closeTooltip = () => {
    cancelHide();
    setShowTooltip(false);
  };
  const closeTooltipSoon = () => {
    cancelHide();
    hideTimer.current = setTimeout(closeTooltip, TOOLTIP_HIDE_DELAY_MS);
  };

  // Measured when hover or focus starts, so a width changed since the last
  // render (e.g. by dragging the divider) is accounted for.
  const openTooltipIfTruncated = () => {
    cancelHide();
    const isTruncated = [labelRef.current, badgeRef.current].some(
      (el) => !!el && el.scrollWidth > el.clientWidth,
    );
    setShowTooltip(isTruncated);
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Document-level so Escape dismisses a hover-opened tooltip too, without
  // moving focus (WCAG 1.4.13, dismissible).
  useEffect(() => {
    if (!showTooltip) { return undefined; }
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { setShowTooltip(false); }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTooltip]);

  // React focus events bubble, so a nested row's focus would also reach this
  // handler; only this row's own `<li>` may open its tooltip.
  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if (event.target === event.currentTarget) { openTooltipIfTruncated(); }
  };
  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (event.target === event.currentTarget) { closeTooltip(); }
  };

  return (
    <li
      className={classNames({
        'competency-group': hasChildren,
        'competency-node--selectable': isSelectable,
        'competency-node--selected': isSelected,
      }) || undefined}
      role={isSelectable ? 'treeitem' : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      aria-selected={isSelectable ? isSelected : undefined}
      aria-labelledby={isSelectable ? labelledBy : undefined}
      aria-expanded={isSelectable && hasChildren ? isExpanded : undefined}
      onClick={isSelectable ? handleSelect : undefined}
      onKeyDown={isSelectable ? handleKeyDown : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        className="competency-row"
        ref={rowRef}
        onMouseEnter={openTooltipIfTruncated}
        onMouseLeave={closeTooltipSoon}
      >
        <ExpandCollapseIconButton
          canExpand={hasChildren}
          isExpanded={isExpanded}
          onToggle={() => onToggle(nodeId)}
          expandLabel={intl.formatMessage(messages.expandRowButtonLabel)}
          collapseLabel={intl.formatMessage(messages.collapseRowButtonLabel)}
        />
        <span className="competency-row__label text-truncate" id={labelId} ref={labelRef}>{node.value}</span>
        {externalId ?
          (
            <>
              <span className="sr-only" id={externalIdLabelId}>
                {intl.formatMessage(messages.competencyIdAccessibleLabel, { externalId })}
              </span>
              <Badge
                variant="info"
                className="competency-row__badge text-truncate ml-auto"
                ref={badgeRef}
                aria-hidden="true"
              >
                {externalId}
              </Badge>
            </>
          ) :
          null}
        <Overlay target={rowRef} show={showTooltip} placement="top" flip>
          <Tooltip
            id={tooltipId}
            className="competency-tooltip"
            variant="light"
            onMouseEnter={cancelHide}
            onMouseLeave={closeTooltipSoon}
          >
            <div>{node.value}</div>
            {externalId && <div>{intl.formatMessage(messages.competencyIdAccessibleLabel, { externalId })}</div>}
          </Tooltip>
        </Overlay>
      </div>
      {isExpanded && hasChildren && (
        <ul role={isSelectable ? 'group' : undefined}>
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
