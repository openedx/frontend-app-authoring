// Utility to validate image file type
export function validateImageFileType(file, allowedTypes = ['image/jpeg', 'image/png']) {
    if (!file) {
        return { isValid: false, error: 'No file selected.' };
    }
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `Only the following formats are supported: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
        };
    }
    return { isValid: true, error: null };
}

// Validate image file type and dimensions (min 300x300, max 1024x1024)
export async function validateImageFile(file, allowedTypes = ['image/jpeg', 'image/png'], minWidth = 300, minHeight = 300, maxWidth = 1024, maxHeight = 1024) {
    const typeResult = validateImageFileType(file, allowedTypes);
    if (!typeResult.isValid) {
        return typeResult;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'Image size should be less than 5MB'
        };
    }

    // Check dimensions
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            if (img.width < minWidth || img.height < minHeight) {
                resolve({
                    isValid: false,
                    error: `Image dimensions are too small. Minimum size is ${minWidth}x${minHeight} pixels. Current size is ${img.width}x${img.height} pixels.`
                });
            } else if (img.width > maxWidth || img.height > maxHeight) {
                resolve({
                    isValid: false,
                    error: `Image dimensions are too large. Maximum size is ${maxWidth}x${maxHeight} pixels. Current size is ${img.width}x${img.height} pixels.`
                });
            } else {
                resolve({ isValid: true, error: null });
            }
        };
        img.onerror = function () {
            resolve({ isValid: false, error: 'Could not read image dimensions.' });
        };
        img.src = URL.createObjectURL(file);
    });
} 