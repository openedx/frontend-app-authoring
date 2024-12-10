/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  Alert,
  Button,
  Collapsible,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../../generic/Loading';
import { CodeEditor, EditorAccessor } from '../../generic/CodeEditor';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import {
  useUpdateXBlockOLX,
  useXBlockOLX,
} from '../data/apiHooks';
import messages from './messages';
import { ComponentAdvancedAssets } from './ComponentAdvancedAssets';

const ComponentAdvancedInfoInner: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const { readOnly, showOnlyPublished } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen in production
  if (!usageKey) {
    throw new Error('sidebarComponentUsageKey is required to render ComponentAdvancedInfo');
  }

  const { data: olx, isLoading: isOLXLoading } = useXBlockOLX(
    usageKey,
    showOnlyPublished ? 'published' : 'draft',
  );
  const editorRef = React.useRef<EditorAccessor | undefined>(undefined);
  const [isEditingOLX, setEditingOLX] = React.useState(false);
  const olxUpdater = useUpdateXBlockOLX(usageKey);
  const updateOlx = React.useCallback(() => {
    const newOLX = editorRef.current?.state.doc.toString();
    if (!newOLX) {
      /* istanbul ignore next */
      throw new Error('Unable to get OLX string from codemirror.'); // Shouldn't happen.
    }
    olxUpdater.mutateAsync(newOLX).then(() => {
      // Only if we succeeded:
      setEditingOLX(false);
    }).catch(() => {
      // On error, an <Alert> is shown below. We catch here to avoid the error propagating up.
    });
  }, [editorRef, olxUpdater, intl]);

  return (
    <>
      <h3 className="h5"><FormattedMessage {...messages.advancedDetailsUsageKey} /></h3>
      <p className="text-monospace small">{usageKey}</p>
      <h3 className="h5"><FormattedMessage {...messages.advancedDetailsOLX} /></h3>
      {(() => {
        if (isOLXLoading) { return <LoadingSpinner />; }
        if (!olx) { return <FormattedMessage {...messages.advancedDetailsOLXError} />; }
        return (
          <div className="mb-4">
            {olxUpdater.error && (
              <Alert variant="danger">
                <p><strong><FormattedMessage {...messages.advancedDetailsOLXEditFailed} /></strong></p>
                {/*
                  TODO: fix the API so it returns 400 errors in a JSON object, not HTML 500 errors. Then display
                  a useful error message here like "parsing the XML failed on line 3".
                  (olxUpdater.error as Record<string, any>)?.customAttributes?.httpErrorResponseData.errorMessage
                */}
              </Alert>
            )}
            <CodeEditor key={usageKey} readOnly={!isEditingOLX} editorRef={editorRef}>{olx}</CodeEditor>
            {
              isEditingOLX ? (
                <>
                  <Button variant="primary" onClick={updateOlx} disabled={olxUpdater.isLoading}>
                    <FormattedMessage {...messages.advancedDetailsOLXSaveButton} />
                  </Button>
                  <Button variant="link" onClick={() => setEditingOLX(false)} disabled={olxUpdater.isLoading}>
                    <FormattedMessage {...messages.advancedDetailsOLXCancelButton} />
                  </Button>
                </>
              ) : !readOnly ? (
                <OverlayTrigger
                  placement="bottom-start"
                  overlay={(
                    <Tooltip id="olx-edit-button">
                      <FormattedMessage {...messages.advancedDetailsOLXEditWarning} />
                    </Tooltip>
                  )}
                >
                  <Button variant="link" onClick={() => setEditingOLX(true)}>
                    <FormattedMessage {...messages.advancedDetailsOLXEditButton} />
                  </Button>
                </OverlayTrigger>
              ) : (
                null
              )
            }
          </div>
        );
      })()}
      <h3 className="h5"><FormattedMessage {...messages.advancedDetailsAssets} /></h3>
      <ComponentAdvancedAssets />
    </>
  );
};

export const ComponentAdvancedInfo: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  return (
    <Collapsible
      styling="basic"
      title={intl.formatMessage(messages.advancedDetailsTitle)}
    >
      <ComponentAdvancedInfoInner />
    </Collapsible>
  );
};
