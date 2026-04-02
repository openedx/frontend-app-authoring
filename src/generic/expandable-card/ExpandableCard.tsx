import { useState, useRef, useEffect } from 'react';
import { Button } from '@openedx/paragon';
import { KeyboardArrowDown, KeyboardArrowUp } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import classNames from 'classnames';

interface ExpandableCardProps {
  children: React.ReactNode;
  maxHeight?: number; // in pixels, default 400
  showMoreLabel?: string;
  showLessLabel?: string;
}

/**
 * An expandable card component that expands and collapses based on its content height.
 * The main text area contains the primary data, while a "Show More" button allows
 * users to view additional details when the main area exceeds a specified height. The "Show Less"
 * button
 */
export const ExpandableCard = ({
  children,
  maxHeight = 400,
  showMoreLabel,
  showLessLabel,
}: ExpandableCardProps) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const showMoreLabelText = showMoreLabel || intl.formatMessage(messages.showMore);
  const showLessLabelText = showLessLabel || intl.formatMessage(messages.showLess);

  useEffect(() => {
    const element = contentRef.current; if (!element) return;
    const checkNeedsExpansion = () => {
      setNeedsExpansion(element.scrollHeight > maxHeight);
    };
    // Initial check
    checkNeedsExpansion();
    // Watch for resize
    const resizeObserver = new ResizeObserver(checkNeedsExpansion);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [maxHeight, children]);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setNeedsExpansion(scrollHeight > maxHeight);
    }
  }, [children, maxHeight]);

  return (
    <div>
      <div
        ref={contentRef}
        className={classNames("p-3" ,{
          "overflow-hidden": !isExpanded,
        })}
        style={{
          maxHeight: isExpanded ? 'none' : `${maxHeight}px`,
        }}
      >
        {children}
      </div>

      {needsExpansion && (
        <div className="d-flex justify-content-center p-0 border-top">
          <Button
            variant="tertiary"
            block
            iconAfter={isExpanded ? KeyboardArrowUp :KeyboardArrowDown}
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-1"
          >
            {isExpanded ? showLessLabelText : showMoreLabelText}
          </Button>
        </div>
      )}
    </div>
  );
};
