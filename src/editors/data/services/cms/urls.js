export const libraryV1 = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/library/${learningContextId}`
);

export const unit = ({ studioEndpointUrl, unitUrl }) => (
  `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0]?.id}`
);

export const returnUrl = ({ studioEndpointUrl, unitUrl, learningContextId }) => {
  if (learningContextId && learningContextId.startsWith('library-v1')) {
    // when the learning context is a v1 library, return to the library page
    return libraryV1({ studioEndpointUrl, learningContextId });
  }
  if (learningContextId && learningContextId.startsWith('lib')) {
    // when it's a v2 library, there will be no return url (instead a closed popup)
    throw new Error('Return url not available (or needed) for V2 libraries');
  }
  // when the learning context is a course, return to the unit page
  if (unitUrl) {
    return unit({ studioEndpointUrl, unitUrl });
  }
  return '';
};

export const block = ({ studioEndpointUrl, blockId }) => (
  blockId.includes('block-v1')
    ? `${studioEndpointUrl}/xblock/${blockId}`
    : `${studioEndpointUrl}/api/xblock/v2/xblocks/${blockId}/fields/`
);

export const blockAncestor = ({ studioEndpointUrl, blockId }) => {
  if (blockId.includes('block-v1')) {
    return `${block({ studioEndpointUrl, blockId })}?fields=ancestorInfo`;
  }
  // this url only need to get info to build the return url, which isn't used by V2 blocks
  throw new Error('Block ancestor not available (and not needed) for V2 blocks');
};

export const blockStudioView = ({ studioEndpointUrl, blockId }) => (
  blockId.includes('block-v1')
    ? `${block({ studioEndpointUrl, blockId })}/studio_view`
    : `${studioEndpointUrl}/api/xblock/v2/xblocks/${blockId}/view/studio_view/`
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

export const mediaTranscriptURL = ({ studioEndpointUrl, transcriptUrl }) => (
  `${studioEndpointUrl}${transcriptUrl}`
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

export const videoFeatures = ({ studioEndpointUrl }) => (
  `${studioEndpointUrl}/video_features/`
);

export const courseVideos = ({ studioEndpointUrl, learningContextId }) => (
  `${studioEndpointUrl}/videos/${learningContextId}`
);
