export const unit = ({ studioEndpointUrl, unitUrl }) => (
  `${studioEndpointUrl}/container/${unitUrl.data.ancestors[0].id}`
);

export const block = ({ studioEndpointUrl, blockId }) => (
  `${studioEndpointUrl}/xblock/${blockId}`
);

export const blockAncestor = ({ studioEndpointUrl, blockId }) => (
  `${block({ studioEndpointUrl, blockId })}?fields=ancestorInfo`
);

export const courseAssets = ({ studioEndpointUrl, courseId }) => (
  `${studioEndpointUrl}/assets/${courseId}/`
);

export const courseImages = ({ studioEndpointUrl, courseId }) => (
  `${courseAssets({ studioEndpointUrl, courseId })}?sort=uploadDate&direction=desc&asset_type=Images`
);
