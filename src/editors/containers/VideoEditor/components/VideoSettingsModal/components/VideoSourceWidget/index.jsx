import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Form,
  IconButtonWithTooltip,
  ActionRow,
  Icon,
  Button,
  Tooltip,
  OverlayTrigger,
} from '@edx/paragon';
import { Delete, Info, Add } from '@edx/paragon/icons';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import * as widgetHooks from '../hooks';
import * as module from './hooks';
import messages from './messages';
import { actions } from '../../../../../../data/redux';

import CollapsibleFormWidget from '../CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video source as well as fallback sources
 */
export const VideoSourceWidget = ({
  // injected
  intl,
  // redux
  updateField,
}) => {
  const dispatch = useDispatch();
  const {
    videoSource: source,
    fallbackVideos,
    allowVideoDownloads: allowDownload,
  } = widgetHooks.widgetValues({
    dispatch,
    fields: {
      [widgetHooks.selectorKeys.videoSource]: widgetHooks.genericWidget,
      [widgetHooks.selectorKeys.fallbackVideos]: widgetHooks.arrayWidget,
      [widgetHooks.selectorKeys.allowVideoDownloads]: widgetHooks.genericWidget,
    },
  });
  const deleteFallbackVideo = module.deleteFallbackVideo({ fallbackVideos: fallbackVideos.formValue, dispatch });
  const updateVideoType = module.updateVideoType({ dispatch });

  return (
    <CollapsibleFormWidget
      title={intl.formatMessage(messages.titleLabel)}
    >
      <Form.Group>
        <div className="border-primary-100 border-bottom pb-4">
          <Form.Control
            floatingLabel={intl.formatMessage(messages.videoIdOrUrlLabel)}
            onChange={source.onChange}
            onBlur={(e) => updateVideoType({ e, source })}
            value={source.local}
          />
        </div>
        <div className="mt-3">
          <FormattedMessage {...messages.fallbackVideoTitle} />
        </div>
        <div>
          <FormattedMessage {...messages.fallbackVideoMessage} />
        </div>
        {fallbackVideos.formValue.map((videoUrl, index) => (
          <Form.Row className="mt-4">
            <Form.Control
              floatingLabel={intl.formatMessage(messages.fallbackVideoLabel)}
              onChange={fallbackVideos.onChange(index)}
              value={fallbackVideos.local[index]}
              onBlur={fallbackVideos.onBlur(index)}
            />
            <IconButtonWithTooltip
              key={`top-delete-${videoUrl}`}
              tooltipPlacement="top"
              tooltipContent={intl.formatMessage(messages.deleteFallbackVideo)}
              src={Delete}
              iconAs={Icon}
              alt={intl.formatMessage(messages.deleteFallbackVideo)}
              onClick={() => deleteFallbackVideo(videoUrl)}
            />
          </Form.Row>
        ))}
        <ActionRow className="mt-4">
          <Form.Checkbox
            checked={allowDownload.local}
            className="decorative-control-label"
            onChange={allowDownload.onCheckedChange}
          >
            <div className="small text-gray-700">
              <FormattedMessage {...messages.allowDownloadCheckboxLabel} />
            </div>
          </Form.Checkbox>
          <OverlayTrigger
            key="top"
            placement="top"
            overlay={(
              <Tooltip id="tooltip-top">
                <FormattedMessage {...messages.tooltipMessage} />
              </Tooltip>
            )}
          >
            <Icon src={Info} style={{ height: '16px', width: '16px' }} />
          </OverlayTrigger>
          <ActionRow.Spacer />
        </ActionRow>
      </Form.Group>
      <Button
        className="text-primary-500 font-weight-bold"
        size="sm"
        iconBefore={Add}
        variant="link"
        onClick={() => updateField({ fallbackVideos: [...fallbackVideos.formValue, ''] })}
      >
        <FormattedMessage {...messages.addButtonLabel} />
      </Button>
    </CollapsibleFormWidget>
  );
};
VideoSourceWidget.propTypes = {
  // injected
  intl: intlShape.isRequired,
  // redux
  updateField: PropTypes.func.isRequired,
};
export const mapStateToProps = () => ({});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(VideoSourceWidget));
