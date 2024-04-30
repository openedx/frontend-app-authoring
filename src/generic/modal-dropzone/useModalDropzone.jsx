import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { uploadAssets } from './data/api';
import messages from './messages';

const useModalDropzone = ({
  onChange, onCancel, onClose, fileTypes, onSavingStatus, onSelectFile,
}) => {
  const { courseId } = useParams();
  const intl = useIntl();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [disabledUploadBtn, setDisabledUploadBtn] = useState(true);

  const VALID_IMAGE_TYPES = ['png', 'jpeg'];

  const imageValidator = (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();

    const extensionsList = fileTypes.map(type => `.${type.toLowerCase()}`).join(', ');
    const typesList = fileTypes.map(type => type.toUpperCase()).join(', ');

    if (!fileTypes.map(type => type.toLowerCase()).includes(fileType)) {
      return intl.formatMessage(messages.uploadImageValidationText, {
        types: typesList,
        extensions: extensionsList,
      });
    }
    return null;
  };

  /**
   * Constructs an accept object for Dropzone based on provided file types.
   *
   * @param {string[]} types - Array of file extensions.
   * @returns {Object} Accept object for Dropzone.
   *
   * Example:
   * input: ['png', 'jpg', 'pdf', 'docx']
   * output:
   *  {
   *    "image/*": [".png", ".jpg"],
   *    "* /*": [".pdf", ".docx"]
   *  }
   */
  const constructAcceptObject = (types) => types
    .reduce((acc, type) => {
      // eslint-disable-next-line no-nested-ternary
      const mimeType = type === 'pdf' ? 'application/pdf' : VALID_IMAGE_TYPES.includes(type) ? 'image/*' : '*/*';
      if (!acc[mimeType]) {
        acc[mimeType] = [];
      }
      acc[mimeType].push(`.${type}`);
      return acc;
    }, {});

  const accept = useMemo(() => constructAcceptObject(fileTypes), [fileTypes]);

  const handleSelectFile = ({ fileData }) => {
    const file = fileData.get('file');

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setDisabledUploadBtn(false);
      };
      reader.readAsDataURL(file);
      setSelectedFile(fileData);

      if (onSelectFile) {
        onSelectFile(file.path);
      }
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setDisabledUploadBtn(true);
    onSavingStatus({ status: RequestStatus.CLEAR });
    setUploadProgress(0);
    onCancel();
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) { return; }

    onSavingStatus(RequestStatus.PENDING);

    const onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(percentCompleted);
    };

    try {
      const response = await uploadAssets(courseId, selectedFile, onUploadProgress);
      const { url } = response.asset;

      if (url) {
        onChange(url);
        onSavingStatus({ status: RequestStatus.SUCCESSFUL });
        onClose();
      }
    } catch (error) {
      onSavingStatus({ status: RequestStatus.FAILED });
    } finally {
      setDisabledUploadBtn(true);
      setUploadProgress(0);
      setPreviewUrl(null);
    }
  };

  return {
    intl,
    accept,
    uploadProgress,
    previewUrl,
    disabledUploadBtn,
    handleSelectFile,
    imageValidator,
    handleCancel,
    handleUpload,
  };
};

export default useModalDropzone;
