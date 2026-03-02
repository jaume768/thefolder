/**
 * Utilidades para manejo de redes sociales
 * Funciones centralizadas para construir URLs completas de redes sociales
 */

/**
 * Construye la URL completa para una red social dada
 * @param {string} platform - Plataforma de red social (instagram, youtube, linkedin, etc.)
 * @param {string} value - Valor almacenado (puede ser username o URL completa)
 * @returns {string} URL completa de la red social
 */
export const buildSocialMediaUrl = (platform, value) => {
    if (!value || value.trim() === '') return '';
    
    const trimmedValue = value.trim();
    
    // Si ya es una URL completa, devolverla tal como está
    if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
        return trimmedValue;
    }
    
    // Construcción de URLs por plataforma
    switch (platform.toLowerCase()) {
        case 'instagram':
            return `https://www.instagram.com/${trimmedValue}/`;
            
        case 'youtube':
            return `https://www.youtube.com/${trimmedValue}/`;
            
        case 'linkedin':
            // LinkedIn puede tener diferentes formatos de usuario
            if (trimmedValue.includes('/in/')) {
                return `https://www.linkedin.com${trimmedValue.startsWith('/') ? '' : '/'}${trimmedValue}`;
            }
            return `https://www.linkedin.com/in/${trimmedValue}/`;
            
        case 'behance':
            return `https://www.behance.net/${trimmedValue}/`;

        case 'tiktok':
            return `https://www.tiktok.com/@${trimmedValue.startsWith('@') ? trimmedValue.substring(1) : trimmedValue}`;
            
        case 'tumblr':
            return `https://www.tumblr.com/${trimmedValue}/`;
            
        case 'pinterest':
            return `https://www.pinterest.com/${trimmedValue}/`;
            
        case 'sitioweb':
        case 'website':
            // Para sitios web, añadir https:// si no lo tiene
            if (!trimmedValue.includes('://')) {
                return `https://${trimmedValue}`;
            }
            return trimmedValue;
            
        default:
            // Para plataformas no reconocidas, añadir https:// si no lo tiene
            if (!trimmedValue.includes('://')) {
                return `https://${trimmedValue}`;
            }
            return trimmedValue;
    }
};

/**
 * Extrae el nombre de usuario de una URL completa de red social
 * @param {string} url - URL completa
 * @param {string} platform - Plataforma de red social
 * @returns {string} Nombre de usuario extraído
 */
export const extractUsernameFromUrl = (url, platform) => {
    if (!url || url.trim() === '') return '';
    
    const trimmedUrl = url.trim();
    
    // Si no es una URL completa, asumimos que ya es el username
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
    }
    
    try {
        const urlObj = new URL(trimmedUrl);
        const pathname = urlObj.pathname;
        
        switch (platform.toLowerCase()) {
            case 'instagram':
                // Instagram: /username/ o /username
                return pathname.replace(/^\//, '').replace(/\/$/, '');
                
            case 'youtube':
                // YouTube: /channel/ID o /user/username o /c/channelname o /@username
                if (pathname.startsWith('/channel/') || pathname.startsWith('/user/') || pathname.startsWith('/c/')) {
                    return pathname.split('/')[2] || '';
                }
                if (pathname.startsWith('/@')) {
                    return pathname.replace('/@', '');
                }
                return pathname.replace(/^\//, '').replace(/\/$/, '');
                
            case 'linkedin':
                // LinkedIn: /in/username/ o /company/companyname/
                if (pathname.startsWith('/in/')) {
                    return pathname.replace('/in/', '').replace(/\/$/, '');
                }
                if (pathname.startsWith('/company/')) {
                    return pathname.replace('/company/', '').replace(/\/$/, '');
                }
                return pathname.replace(/^\//, '').replace(/\/$/, '');
                
            case 'behance':
            case 'tumblr':
            case 'tiktok':
            case 'pinterest':
                // Formato estándar: /username/
                return pathname.replace(/^\/@?/, '').replace(/\/$/, '');

                
            default:
                return pathname.replace(/^\//, '').replace(/\/$/, '');
        }
    } catch (error) {
        // Si la URL no es válida, devolver el valor original
        return trimmedUrl;
    }
};

/**
 * Valida si una URL de red social es válida
 * @param {string} platform - Plataforma de red social
 * @param {string} value - Valor a validar
 * @returns {boolean} True si es válida
 */
export const validateSocialMediaUrl = (platform, value) => {
    if (!value || value.trim() === '') return true; // Permitir campos vacíos
    
    const url = buildSocialMediaUrl(platform, value);
    
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
