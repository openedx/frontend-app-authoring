import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, OverlayTrigger, Spinner, Tooltip } from '@openedx/paragon';
import { EditorComponent } from '@src/editors/EditorComponent';
import EditorContainer from '@src/editors/containers/EditorContainer';
import { FieldArray, useFormikContext } from 'formik';
import { isEqual } from 'lodash';
import { PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { FlashcardsEditorContext } from '../context';
import messages from '../messages';
import { emptyCard, FlashcardsState, ImageData } from '../types';
import { InfoOutline, Plus } from '@openedx/paragon/icons';
import DraggableList from '@src/generic/DraggableList';
import FlashcardsCard from './FlashcardsCard';
import SettingsSidebar from './SettingsSidebar';
import { FlashcardsImageSettingsModal } from './FlashcardsImageSettingsModal';

const EditorWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const intl = useIntl();
  const { isPending, fetchError } = useContext(FlashcardsEditorContext);
  if (fetchError) {
    return (
      <div className="text-center p-6">
        <FormattedMessage {...messages.loadErrorHeading} />
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenReaderText={intl.formatMessage(messages.loadingSpinner)}
        />
      </div>
    );
  }
  return <>{children}</>; /* eslint-disable-line react/jsx-no-useless-fragment */
};

export const FlashcardsEditorComponent: React.FC<EditorComponent> = (props) => {
  const intl = useIntl();
  const { fields } = useContext(FlashcardsEditorContext);
  const originalState = useRef({ ...fields });
  const { values, setValues, setFieldValue } = useFormikContext<FlashcardsState>();

  useEffect(() => {
    // Form is initialized before we get these values, so we have to set them
    // when they arrive.
    void setValues(fields); // eslint-disable-line no-void
  }, [fields]);

  const isDirty = () => isEqual(originalState, values);

  const getContent = () => {
    const settings = { ...values };
    // TODO: strip out empty cards
    return settings;
  };

  const [imageSettings, setImageSettings] = useState<ImageData | null>(null);

  return (
    <EditorContainer {...props} isDirty={isDirty} getContent={getContent}>
      <EditorWrapper>
        <div className="h-75 overflow-auto">
          <div className="d-flex w-100 py-2">
            <div className="flex-grow-1 mr-3">
              <div className="w-100 mb-3 d-flex align-items-center">
                <div className="text-primary-500 font-weight-bold mr-1">
                  {intl.formatMessage(messages.descriptionHeaderFlashcard)}
                </div>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="description-tooltip">
                      {intl.formatMessage(messages.descriptionFlashcard)}
                    </Tooltip>
                  }
                >
                  <Icon src={InfoOutline} />
                </OverlayTrigger>
              </div>
              <FieldArray name="cards">
                {(arrayHelpers) => (
                  <>
                    <DraggableList
                      itemList={fields.cards.map((card) => ({ id: card.cardKey, ...card }))}
                      setState={() => {/* TODO */}}
                      updateOrder={() => () => undefined}
                    >
                      {fields.cards.map((card, index) => (
                        <FlashcardsCard
                          key={card.cardKey}
                          index={index}
                        />
                      ))}
                    </DraggableList>
                    <Button
                      className="text-primary-500 pl-3"
                      onClick={() => arrayHelpers.push(emptyCard())}
                      iconBefore={Plus}
                      variant="tertiary"
                    >
                      {intl.formatMessage(messages.addLabel)}
                    </Button>
                  </>
                )}
              </FieldArray>
            </div>
            <SettingsSidebar />
          </div>
        </div>
        {imageSettings !== null && (
          <FlashcardsImageSettingsModal
            imageData={imageSettings}
            onCancel={() => setImageSettings(null)}
            onSave={(altText) =>
              setFieldValue(`cards.${imageSettings.index}.${imageSettings.cardSide}ImageAlt`, altText)}
          />
        )}
      </EditorWrapper>
    </EditorContainer>
  );
};
