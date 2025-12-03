import { ActionRow } from '@openedx/paragon';
import { ReactElement, } from 'react';

interface SubHeaderProps {
  title: ReactElement | string | null;
  subtitle?: string;
  breadcrumbs?: ReactElement | ReactElement[] | string | null;
  contentTitle?: string;
  description?: string;
  instruction?: ReactElement | string,
  headerActions?: ReactElement | ReactElement[] | null;
  titleActions?: ReactElement | ReactElement[] | null;
  hideBorder?: boolean;
  withSubHeaderContent?: boolean;
};

const SubHeader = ({
  title,
  subtitle = '',
  breadcrumbs,
  contentTitle,
  description = '',
  instruction,
  headerActions,
  titleActions,
  hideBorder = false,
  withSubHeaderContent,
}: SubHeaderProps) => (
  <div className={`${!hideBorder && 'border-bottom border-light-400'} mb-3`}>
    {breadcrumbs && (
      <div className="sub-header-breadcrumbs">{breadcrumbs}</div>
    )}
    <header className="sub-header">
      <h2 className="sub-header-title">
        <small className="sub-header-title-subtitle">{subtitle}</small>
        {title}
        {titleActions && (
          <ActionRow className="ml-auto mt-2 justify-content-start">
            {titleActions}
          </ActionRow>
        )}
      </h2>
      {headerActions && (
        <ActionRow className="ml-auto flex-shrink-0 sub-header-actions">
          {headerActions}
        </ActionRow>
      )}
    </header>
    {contentTitle && withSubHeaderContent && (
      <header className="sub-header-content">
        <h2 className="sub-header-content-title">{contentTitle}</h2>
        <span className="small text-gray-700">{description}</span>
      </header>
    )}
    {instruction && (
      <p className="sub-header-instructions mb-4">{instruction}</p>
    )}
  </div>
);

export default SubHeader;
