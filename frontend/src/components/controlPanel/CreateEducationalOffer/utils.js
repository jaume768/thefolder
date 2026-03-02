// Form validation for the CreateEducationalOffer component
export const validateForm = (formData) => {
    const newErrors = {};
    
    if (formData.programName && formData.programName.length > 100) {
        newErrors.programName = 'El título no puede exceder los 100 caracteres';
    }
    
    if (formData.websiteUrl && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.websiteUrl)) {
        newErrors.websiteUrl = 'Por favor, introduce una URL válida';
    }
    
    if (formData.duration && (isNaN(formData.duration) || parseInt(formData.duration) <= 0)) {
        newErrors.duration = 'La duración debe ser un número positivo';
    }
    
    if (formData.credits && (isNaN(formData.credits) || parseInt(formData.credits) <= 0)) {
        newErrors.credits = 'Los créditos deben ser un número positivo';
    }
    
    // Validaciones de fechas
    if (formData.enrollmentStartDate && formData.enrollmentEndDate) {
        const startDate = new Date(formData.enrollmentStartDate);
        const endDate = new Date(formData.enrollmentEndDate);
        
        if (startDate > endDate) {
            newErrors.enrollmentDates = 'La fecha de inicio no puede ser posterior a la fecha de finalización';
        }
    }
    
    return newErrors;
};
