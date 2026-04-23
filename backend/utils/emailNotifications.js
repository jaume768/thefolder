const SibApiV3Sdk = require('sib-api-v3-sdk');
const { getEmailTemplate } = require('./emailTemplates');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

/**
 * Envía un email de notificación sobre cambio de estado de una oferta de trabajo
 * @param {string} email - Email del destinatario
 * @param {string} userName - Nombre del usuario
 * @param {object} offer - Datos de la oferta
 * @param {string} status - Nuevo estado de la oferta (accepted, rejected, cancelled)
 * @param {string} [locale='es'] - Idioma del email ('es' | 'en')
 */
const sendJobOfferStatusNotification = async (email, userName, offer, status, locale = 'es') => {
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = { email: "jaumefernandezsunyer12@gmail.com", name: "Study" };
    const receivers = [{ email }];

    let templateKey;
    const vars = { userName, offer };

    switch (status) {
        case 'accepted':
            templateKey = 'jobOfferAccepted';
            break;
        case 'rejected':
        case 'cancelled':
            templateKey = 'jobOfferRejected';
            vars.cancelled = status === 'cancelled';
            break;
        default:
            return; // No enviar email para otros estados
    }

    const { subject, html } = getEmailTemplate(templateKey, locale, vars);

    try {
        const result = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject,
            htmlContent: html,
        });
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Envía un email de notificación sobre cambio de estado de una oferta educativa
 * @param {string} email - Email del destinatario
 * @param {string} userName - Nombre del usuario o institución
 * @param {object} offer - Datos de la oferta educativa
 * @param {string} status - Nuevo estado de la oferta (accepted, rejected)
 * @param {string} [locale='es'] - Idioma del email ('es' | 'en')
 */
const sendEducationalOfferStatusNotification = async (email, userName, offer, status, locale = 'es') => {
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = { email: "jaumefernandezsunyer12@gmail.com", name: "Study" };
    const receivers = [{ email }];

    let templateKey;
    switch (status) {
        case 'accepted':
            templateKey = 'educationalOfferAccepted';
            break;
        case 'rejected':
            templateKey = 'educationalOfferRejected';
            break;
        default:
            return;
    }

    const { subject, html } = getEmailTemplate(templateKey, locale, { userName, offer });

    try {
        const result = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject,
            htmlContent: html,
        });
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    sendJobOfferStatusNotification,
    sendEducationalOfferStatusNotification
};
