/**
 * Utilitaire pour optimiser les images avec conversion WebP
 * Utilise l'API de transformation d'images de Supabase Storage
 */

// Détecter si le navigateur supporte WebP
const supportsWebP = (() => {
    if (typeof window === 'undefined') return true;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

interface ImageOptimizeOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
}

/**
 * Optimise une URL d'image Supabase en ajoutant les paramètres de transformation
 * @param url - URL de l'image originale
 * @param options - Options de transformation
 * @returns URL optimisée
 */
export const optimizeImage = (
    url: string | undefined | null,
    options: ImageOptimizeOptions = {}
): string => {
    if (!url) return '/placeholder.png';

    const {
        width = 400,
        height,
        quality = 80,
        format = supportsWebP ? 'webp' : 'origin'
    } = options;

    // Si ce n'est pas une URL Supabase Storage, retourner l'URL originale
    if (!url.includes('supabase.co/storage')) {
        return url;
    }

    try {
        const urlObj = new URL(url);

        // Transformer /storage/v1/object/public/ en /storage/v1/render/image/public/
        const transformedPath = urlObj.pathname.replace(
            '/storage/v1/object/public/',
            '/storage/v1/render/image/public/'
        );

        // Construire l'URL avec les paramètres de transformation
        const params = new URLSearchParams();
        params.set('width', width.toString());
        if (height) params.set('height', height.toString());
        params.set('quality', quality.toString());
        if (format !== 'origin') params.set('format', format);

        return `${urlObj.origin}${transformedPath}?${params.toString()}`;
    } catch (e) {
        // En cas d'erreur, retourner l'URL originale
        return url;
    }
};

/**
 * Crée un ensemble d'URLs optimisées pour le srcset responsive
 * @param url - URL de l'image originale
 * @param sizes - Tailles à générer
 * @returns srcset string
 */
export const generateSrcSet = (
    url: string | undefined | null,
    sizes: number[] = [200, 400, 600, 800]
): string => {
    if (!url) return '';

    return sizes
        .map(size => `${optimizeImage(url, { width: size })} ${size}w`)
        .join(', ');
};

/**
 * Précharge une image optimisée
 * @param url - URL de l'image
 */
export const preloadImage = (url: string): void => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeImage(url);
    document.head.appendChild(link);
};

export default optimizeImage;
