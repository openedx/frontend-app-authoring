import { useEffect, useRef, useState } from 'react';
import {
  OverlayTrigger,
  Popover,
} from '@openedx/paragon';

import { TaxonomyTypeIcon } from './TaxonomyTypeIcon';
import { TaxonomyType } from '../data/constants';

interface TaxonomyCardHeaderTitleProps {
  taxonomyId: number;
  title: string;
  taxonomyType?: TaxonomyType;
}

/**
 * The title of a taxonomy card: the type icon plus the name of the taxonomy,
 * truncated with a tooltip when it doesn't fit.
 */
export const TaxonomyCardHeaderTitle = ({
  title,
  taxonomyId,
  taxonomyType,
}: TaxonomyCardHeaderTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const textWidth = textRef.current?.offsetWidth ?? 0;
    setIsTruncated(textWidth > containerWidth);
  }, [title]);

  const getToolTip = () => (
    <Popover
      id={`taxonomy-card-title-tooltip-${taxonomyId}`}
      className="mw-300px"
    >
      <Popover.Content>
        {title}
      </Popover.Content>
    </Popover>
  );

  return (
    <div className="d-flex align-items-center taxonomy-card-title">
      <TaxonomyTypeIcon taxonomyType={taxonomyType} className="mr-2" />
      <OverlayTrigger
        key={`taxonomy-card-title-overlay-${taxonomyId}`}
        placement="top"
        overlay={getToolTip()}
        show={!isTruncated ? false : undefined}
      >
        <div ref={containerRef} className="text-truncate taxonomy-card-title-text">
          <span ref={textRef}>{title}</span>
        </div>
      </OverlayTrigger>
    </div>
  );
};
