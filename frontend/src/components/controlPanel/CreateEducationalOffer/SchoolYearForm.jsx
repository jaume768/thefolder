import React from 'react';
import { useTranslation } from 'react-i18next';

const SchoolYearForm = ({ formData, handleInputChange }) => {
    const { t } = useTranslation('offers');
    return (
        <div className="create-educational-form-section">
            <h3>{t('create.schoolYear.title')}</h3>
            
            <div className="create-educational-form-row">
                <div className="create-educational-form-field">
                    <label htmlFor="schoolYearStartMonth">{t('create.schoolYear.startMonth')}</label>
                    <select
                        id="schoolYearStartMonth"
                        name="schoolYearStartMonth"
                        value={formData.schoolYearStartMonth}
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
                <div className="create-educational-form-field">
                    <label htmlFor="schoolYearEndMonth">{t('create.schoolYear.endMonth')}</label>
                    <select
                        id="schoolYearEndMonth"
                        name="schoolYearEndMonth"
                        value={formData.schoolYearEndMonth}
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
        </div>
    );
};

export default SchoolYearForm;
