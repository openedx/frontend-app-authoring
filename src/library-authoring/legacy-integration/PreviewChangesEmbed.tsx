import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import CompareChangesWidget from '../component-comparison/CompareChangesWidget';
import { useLibraryBlockMetadata } from '../data/apiHooks';
import messages from '../component-comparison/messages';

/**
 * This view is only used to support the legacy UI.
 * On the legacy unit page, when a v2 library block has been used in a course
 * AND an updated version of that block is available, this view is rendered in
 * an iframe in a modal, and allows the author to preview the changes before
 * accepting them (before syncing the course version with the latest library
 * version).
 *
 * The inner <CompareChangesWidget> will be used by this MFE as well, on the
 * new MFE unit page.
 */
const PreviewChangesEmbed = () => {
  const intl = useIntl();
  const { usageKey } = useParams();
  if (usageKey === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing usageKey.');
  }
  const [queryString] = useSearchParams();
  const oldVersion = parseInt(queryString.get('old') ?? '', 10) || 'published';
  const { data: metadata } = useLibraryBlockMetadata(usageKey);

  return (
    <>
      {/* It's not necessary since this will usually be in an <iframe>,
          but it's good practice to set a title for any top level page */}
      <Helmet><title>{intl.formatMessage(messages.iframeTitlePrefix)} | {metadata?.displayName ?? ''} | {process.env.SITE_NAME}</title></Helmet>
      <CompareChangesWidget usageKey={usageKey} oldVersion={oldVersion} newVersion="published" />
    </>
  );
};

export default PreviewChangesEmbed;
