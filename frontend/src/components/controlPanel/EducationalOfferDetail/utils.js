// Format date string
export const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Format price
export const formatPrice = (price) => {
    if (!price || !price.amount) return 'Precio no especificado';
    return `${price.amount.toLocaleString('es-ES')} ${price.currency || 'EUR'}`;
};

// Format duration
export const formatDuration = (duration) => {
    if (!duration) return 'No especificada';
    return `${duration.value} ${duration.unit}`;
};
