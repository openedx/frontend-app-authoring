export const libraryV1 = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/library/${learningContextId}`
);

export const unit = ({ studioEndpointUrl, unitUrl }) => (
  `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`
);

export const returnUrl = ({ studioEndpointUrl, unitUrl, learningContextId }) => {
  if (learningContextId && learningContextId.includes('library-v1')) {
    // when the learning context is a v1 library, return to the library page
    return libraryV1({ studioEndpointUrl, learningContextId });
  }
  // when the learning context is a course, return to the unit page
  return unitUrl ? unit({ studioEndpointUrl, unitUrl }) : '';
};

export const block = ({ studioEndpointUrl, blockId }) => (
  `${studioEndpointUrl}/xblock/${blockId}`
);

export const blockAncestor = ({ studioEndpointUrl, blockId }) => (
  `${block({ studioEndpointUrl, blockId })}?fields=ancestorInfo`
);

export const blockStudioView = ({ studioEndpointUrl, blockId }) => (
  `${block({ studioEndpointUrl, blockId })}/studio_view`
);

export const courseAssets = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/assets/${learningContextId}/`
);

export const courseImages = ({ studioEndpointUrl, learningContextId }) => (
  `${courseAssets({ studioEndpointUrl, learningContextId })}?sort=uploadDate&direction=desc&asset_type=Images`
);

export const videoTranscripts = ({ studioEndpointUrl, blockId }) => (
  `${block({ studioEndpointUrl, blockId })}/handler/studio_transcript/translation`
);

export const downloadVideoTranscriptURL = ({ studioEndpointUrl, blockId, language }) => (
  `${videoTranscripts({ studioEndpointUrl, blockId })}?language_code=${language}`
);
