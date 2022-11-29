import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Form,
  IconButtonWithTooltip,
  ActionRow,
  Icon,
  Button,
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
        <Form.Label className="mt-3">
          <FormattedMessage {...messages.fallbackVideoTitle} />
        </Form.Label>
        <Form.Text>
          <FormattedMessage {...messages.fallbackVideoMessage} />
        </Form.Text>
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
            <Form.Label>
              <FormattedMessage {...messages.allowDownloadCheckboxLabel} />
            </Form.Label>
          </Form.Checkbox>
          <IconButtonWithTooltip
            key="top"
            tooltipPlacement="top"
            tooltipContent={intl.formatMessage(messages.tooltipMessage)}
            src={Info}
            iconAs={Icon}
            alt={intl.formatMessage(messages.tooltipMessage)}
          />
          <ActionRow.Spacer />
        </ActionRow>
      </Form.Group>
      <Button
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
