import StrictDict from './StrictDict';

/**
 * A dictionary that maps file extensions to their corresponding MIME types for images.
 *
 * @example
 * acceptedImgMimeTypes.gif // "image/gif"
 */

const acceptedImgMimeTypes = StrictDict({
  gif: 'image/gif',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  ico: 'image/x-icon',
});

type TinyMCEImageData = {
  displayName: string,
  contentType: string,
  url: string,
  externalUrl: string,
  portableUrl: string,
  thumbnail: string,
  id: string,
  locked: boolean,
};

export type LibraryAssetResponse = {
  path: string,
  size: number,
  url: string,
};

/**
 * Extracts the file name from a file path.
 * This function strips the directory structure and returns the base file name.
 *
 * @param data - The asset data containing the file path.
 * @returns The file name extracted from the path.
 *
 * @example
 * const data = { path: '/static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' };
 * const fileName = getFileName(data); // "example.jpg"
 */

export const getFileName = (data: LibraryAssetResponse): string => data.path.replace(/^.*[\\/]/, '');

/**
 * Determines the MIME type of a file based on its extension.
 *
 * @param data - The asset data containing the file path.
 * @returns The MIME type of the file, or 'unknown' if the MIME type is not recognized.
 *
 * @example
 * const data = { path: '/static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' };
 * const mimeType = getFileMimeType(data); // "image/jpg"
 */

export const getFileMimeType = (data: LibraryAssetResponse): string => {
  const ext = data.path.split('.').pop()?.toLowerCase(); // Extract and lowercase the file extension
  return ext && acceptedImgMimeTypes[ext] ? acceptedImgMimeTypes[ext] : 'unknown';
};
/**
 * Parses a `LibraryAssetResponse` into a `TinyMCEImageData` object.
 * This includes extracting the file name, MIME type, and constructing other image-related metadata.
 *
 * @param data - The asset data to parse.
 * @returns The parsed image data with properties like `displayName`, `contentType`, etc.
 *
 * @example
 * const data = { path: '/static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' };
 * const imageData = parseLibraryImageData(data);
 * // {
 * //   displayName: 'example.jpg',
 * //   contentType: 'image/jpg',
 * //   url: 'http://example.com/static/example.jpg',
 * //   externalUrl: 'http://example.com/static/example.jpg',
 * //   portableUrl: '/static/example.jpg',
 * //   thumbnail: 'http://example.com/static/example.jpg',
 * //   id: '/static/example.jpg',
 * //   locked: false
 * // }
 */

export const parseLibraryImageData = (data: LibraryAssetResponse): TinyMCEImageData => ({
  displayName: getFileName(data),
  contentType: getFileMimeType(data),
  url: data.url,
  externalUrl: data.url,
  portableUrl: data.path,
  thumbnail: data.url,
  id: data.path,
  locked: false,
});

/**
 * Filters and transforms an array of `LibrariesAssetResponse` objects into a dictionary of `TinyMCEImageData`.
 * Only assets with recognized MIME types (i.e., valid image files) are included in the result.
 *
 * @param librariesAssets - The array of asset data to process.
 * @returns A dictionary where each key is the file name and the value is the corresponding `TinyMCEImageData`.
 *
 * @example
 * const assets = [
 *   { path: '/static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' },
 *   { path: '/assets/files/unsupported.xyz', size: 67890, url: 'http://example.com/assets/files/unsupported.xyz' }
 * ];
 * const imageAssets = getLibraryImageAssets(assets);
 * // {
 * //   'example.jpg': {
 * //     displayName: 'example.jpg',
 * //     contentType: 'image/jpg',
 * //     url: 'http://example.com/static/example.jpg',
 * //     externalUrl: 'http://example.com/static/example.jpg',
 * //     portableUrl: '/static/example.jpg',
 * //     thumbnail: 'http://example.com/static/example.jpg',
 * //     id: '/static/example.jpg',
 * //     locked: false
 * //   }
 * // }
 */

export const getLibraryImageAssets = (
  librariesAssets: Array<LibraryAssetResponse>,
): Record<string, TinyMCEImageData> => librariesAssets.reduce((obj, file) => {
  if (getFileMimeType(file) !== 'unknown') {
    const imageData = parseLibraryImageData(file);
    return { ...obj, [imageData.displayName]: imageData };
  }
  return obj;
}, {} as Record<string, TinyMCEImageData>);
