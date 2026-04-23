import React from 'react';
import { useTranslation } from 'react-i18next';

const EnrollmentForm = ({ formData, handleInputChange, errors }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-section">
            <h3>{t('create.enrollment.title')}</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentStartDate">{t('create.enrollment.startDay')}</label>
                    <input
                        type="number"
                        id="enrollmentStartDate"
                        name="enrollmentStartDate"
                        value={formData.enrollmentStartDate}
                        onChange={handleInputChange}
                        placeholder={t('create.enrollment.dayPlaceholder')}
                        min="1"
                        max="31"
                    />
                </div>
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentStartMonth">{t('create.enrollment.month')}</label>
                    <select
                        id="enrollmentStartMonth"
                        name="enrollmentStartMonth"
                        value={formData.enrollmentStartMonth}
                        onChange={handleInputChange}
                    >
                        <option value="">{t('create.enrollment.select')}</option>
                        <option value="Enero">{t('create.months.jan')}</option>
                        <option value="Febrero">{t('create.months.feb')}</option>
                        <option value="Marzo">{t('create.months.mar')}</option>
                        <option value="Abril">{t('create.months.apr')}</option>
                        <option value="Mayo">{t('create.months.may')}</option>
                        <option value="Junio">{t('create.months.jun')}</option>
                        <option value="Julio">{t('create.months.jul')}</option>
                        <option value="Agosto">{t('create.months.aug')}</option>
                        <option value="Septiembre">{t('create.months.sep')}</option>
                        <option value="Octubre">{t('create.months.oct')}</option>
                        <option value="Noviembre">{t('create.months.nov')}</option>
                        <option value="Diciembre">{t('create.months.dec')}</option>
                    </select>
                </div>
            </div>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentEndDate">{t('create.enrollment.endDay')}</label>
                    <input
                        type="number"
                        id="enrollmentEndDate"
                        name="enrollmentEndDate"
                        value={formData.enrollmentEndDate}
                        onChange={handleInputChange}
                        placeholder={t('create.enrollment.dayPlaceholder')}
                        min="1"
                        max="31"
                    />
                </div>
                <div className="create-educational-form-field">
                    <label htmlFor="enrollmentEndMonth">{t('create.enrollment.month')}</label>
                    <select
                        id="enrollmentEndMonth"
                        name="enrollmentEndMonth"
                        value={formData.enrollmentEndMonth}
                        onChange={handleInputChange}
                    >
                        <option value="">{t('create.enrollment.select')}</option>
                        <option value="Enero">{t('create.months.jan')}</option>
                        <option value="Febrero">{t('create.months.feb')}</option>
                        <option value="Marzo">{t('create.months.mar')}</option>
                        <option value="Abril">{t('create.months.apr')}</option>
                        <option value="Mayo">{t('create.months.may')}</option>
                        <option value="Junio">{t('create.months.jun')}</option>
                        <option value="Julio">{t('create.months.jul')}</option>
                        <option value="Agosto">{t('create.months.aug')}</option>
                        <option value="Septiembre">{t('create.months.sep')}</option>
                        <option value="Octubre">{t('create.months.oct')}</option>
                        <option value="Noviembre">{t('create.months.nov')}</option>
                        <option value="Diciembre">{t('create.months.dec')}</option>
                    </select>
                </div>
            </div>
            {errors.enrollmentDates && <span className="create-educational-error-message">{errors.enrollmentDates}</span>}
        </div>
    );
};

export default EnrollmentForm;
