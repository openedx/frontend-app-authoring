import { LibraryAssetResponse } from '../../library-authoring/data/api';

type GalleryImageData = {
  displayName: string,
  url: string,
  externalUrl: string,
  portableUrl: string,
  thumbnail: string,
  id: string,
  locked: boolean,
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
 * Checks if the provided asset data corresponds to an accepted image file type based on its extension.
 *
 * @param data - The asset data containing the file path.
 * @param acceptedImgExt - The array of accepted image extensions.
 * @returns `true` if the file has an accepted image extension, otherwise `false`.
 *
 * @example
 * const data = { path: '/static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' };
 * const isImg = isImage(data); // Returns true
 */

export const isImage = (data: LibraryAssetResponse, acceptedImgExt:string[]): boolean => {
  const ext = data.path.split('.').pop()?.toLowerCase() ?? ''; // Extract and lowercase the file extension
  return ext !== '' && acceptedImgExt.includes(ext);
};
/**
 * Parses a `LibraryAssetResponse` into a `GalleryImageData` object.
 * This includes extracting the file name and constructing other image-related metadata.
 *
 * @param data - The asset data to parse.
 * @returns The parsed image data with properties like `displayName`, `externalUrl`, etc.
 *
 * @example
 * const data = { path: '/static/example.jpg', size: 12345, url: 'http://example.com/static/example.jpg' };
 * const imageData = parseLibraryImageData(data);
 * // {
 * //   displayName: 'example.jpg',
 * //   url: 'http://example.com/static/example.jpg',
 * //   externalUrl: 'http://example.com/static/example.jpg',
 * //   portableUrl: '/static/example.jpg',
 * //   thumbnail: 'http://example.com/static/example.jpg',
 * //   id: '/static/example.jpg',
 * //   locked: false
 * // }
 */

export const parseLibraryImageData = (data: LibraryAssetResponse): GalleryImageData => ({
  displayName: getFileName(data),
  url: data.url,
  externalUrl: data.url,
  portableUrl: data.path,
  thumbnail: data.url,
  id: data.path,
  locked: false,
});

/**
 * Filters and transforms an array of `LibrariesAssetResponse` objects into a dictionary of `GalleryImageData`.
 * Only assets with recognized extension (i.e., valid image files) are included in the result.
 *
 * @param librariesAssets - The array of asset data to process.
 * @param acceptedImgExt - The array of accepted image extensions.
 * @returns A dictionary where each key is the file name and the value is the corresponding `GalleryImageData`.
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
  acceptedImgExt:string[],
): Record<string, GalleryImageData> => librariesAssets.reduce((obj, file) => {
  if (isImage(file, acceptedImgExt)) {
    const imageData = parseLibraryImageData(file);
    return { ...obj, [imageData.displayName]: imageData };
  }
  return obj;
}, {} as Record<string, GalleryImageData>);
