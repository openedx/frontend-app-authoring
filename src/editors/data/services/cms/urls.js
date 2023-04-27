export const libraryV1 = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/library/${learningContextId}`
);

export const unit = ({ studioEndpointUrl, unitUrl }) => (
  `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0]?.id}`
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
  `${studioEndpointUrl}/assets/${learningContextId}/?page_size=500`
);

export const thumbnailUpload = ({ studioEndpointUrl, learningContextId, videoId }) => (
  `${studioEndpointUrl}/video_images/${learningContextId}/${videoId}`
);

export const videoTranscripts = ({ studioEndpointUrl, blockId }) => (
  `${block({ studioEndpointUrl, blockId })}/handler/studio_transcript/translation`
);

export const downloadVideoTranscriptURL = ({ studioEndpointUrl, blockId, language }) => (
  `${videoTranscripts({ studioEndpointUrl, blockId })}?language_code=${language}`
);

export const downloadVideoHandoutUrl = ({ studioEndpointUrl, handout }) => (
  `${studioEndpointUrl}${handout}`
);

export const courseDetailsUrl = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/settings/details/${learningContextId}`
);

export const checkTranscriptsForImport = ({ studioEndpointUrl, parameters }) => (
  `${studioEndpointUrl}/transcripts/check?data=${parameters}`
);

export const replaceTranscript = ({ studioEndpointUrl, parameters }) => (
  `${studioEndpointUrl}/transcripts/replace?data=${parameters}`
);

export const courseAdvanceSettings = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/api/contentstore/v0/advanced_settings/${learningContextId}`
);

export const videoFeatures = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/video_features/${learningContextId}`
);

export const courseVideos = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/videos/${learningContextId}`
);
