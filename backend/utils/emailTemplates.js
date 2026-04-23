/**
 * Plantillas de emails transaccionales bilingües (ES/EN).
 *
 * Uso:
 *   const { getEmailTemplate, normalizeLocale } = require('./emailTemplates');
 *   const { subject, html } = getEmailTemplate('resetPassword', locale, { code });
 */

const normalizeLocale = (lng) => {
  if (!lng) return 'es';
  const base = String(lng).toLowerCase().split('-')[0];
  return base === 'en' ? 'en' : 'es';
};

const templates = {
  /* --------------------------- AUTH --------------------------- */
  resetPassword: {
    es: {
      subject: 'Restablece tu contraseña',
      html: ({ code }) =>
        `<p>Tu código para restablecer la contraseña es: <strong>${code}</strong></p>`,
    },
    en: {
      subject: 'Reset your password',
      html: ({ code }) =>
        `<p>Your password reset code is: <strong>${code}</strong></p>`,
    },
  },

  verificationCode: {
    es: {
      subject: 'Tu código de verificación',
      html: ({ code }) =>
        `<p>Tu código de verificación es: <strong>${code}</strong></p>`,
    },
    en: {
      subject: 'Your verification code',
      html: ({ code }) =>
        `<p>Your verification code is: <strong>${code}</strong></p>`,
    },
  },

  /* ---------------------- JOB OFFER STATUS -------------------- */
  jobOfferAccepted: {
    es: {
      subject: '¡Tu oferta de trabajo ha sido aceptada!',
      html: ({ userName, offer }) => `
        <h2>¡Enhorabuena ${userName}!</h2>
        <p>Nos complace informarte que tu oferta de trabajo <strong>${offer.position}</strong> ha sido revisada y aceptada.</p>
        <p>Ya está publicada en nuestra plataforma y los usuarios pueden verla y aplicar a ella.</p>
        <p>Detalles de la oferta:</p>
        <ul>
          <li><strong>Posición:</strong> ${offer.position}</li>
          <li><strong>Empresa:</strong> ${offer.company}</li>
          <li><strong>Ubicación:</strong> ${offer.location}</li>
        </ul>
        <p>Puedes acceder a tu panel de control para ver las aplicaciones y gestionar tu oferta.</p>
        <p>¡Gracias por confiar en nuestra plataforma!</p>
      `,
    },
    en: {
      subject: 'Your job offer has been accepted!',
      html: ({ userName, offer }) => `
        <h2>Congratulations ${userName}!</h2>
        <p>We are pleased to inform you that your job offer <strong>${offer.position}</strong> has been reviewed and accepted.</p>
        <p>It is now published on our platform and users can view and apply to it.</p>
        <p>Offer details:</p>
        <ul>
          <li><strong>Position:</strong> ${offer.position}</li>
          <li><strong>Company:</strong> ${offer.company}</li>
          <li><strong>Location:</strong> ${offer.location}</li>
        </ul>
        <p>You can access your control panel to view applications and manage your offer.</p>
        <p>Thank you for trusting our platform!</p>
      `,
    },
  },

  jobOfferRejected: {
    es: {
      subject: 'Actualización sobre tu oferta de trabajo',
      html: ({ userName, offer, cancelled }) => `
        <h2>Hola ${userName}</h2>
        <p>Lamentamos informarte que tu oferta de trabajo <strong>${offer.position}</strong> ha sido ${cancelled ? 'cancelada' : 'rechazada'}.</p>
        <p>Esto puede deberse a varios motivos:</p>
        <ul>
          <li>La oferta no cumple con nuestras políticas</li>
          <li>Falta información importante</li>
          <li>Contenido inapropiado</li>
        </ul>
        <p>Si tienes alguna duda o quieres más información, no dudes en contactar con nuestro equipo de soporte.</p>
        <p>Puedes revisar y modificar tu oferta para volver a enviarla.</p>
      `,
    },
    en: {
      subject: 'Update about your job offer',
      html: ({ userName, offer, cancelled }) => `
        <h2>Hi ${userName}</h2>
        <p>We are sorry to inform you that your job offer <strong>${offer.position}</strong> has been ${cancelled ? 'cancelled' : 'rejected'}.</p>
        <p>This may be due to several reasons:</p>
        <ul>
          <li>The offer does not comply with our policies</li>
          <li>Important information is missing</li>
          <li>Inappropriate content</li>
        </ul>
        <p>If you have any questions or want more information, feel free to contact our support team.</p>
        <p>You can review and edit your offer to resubmit it.</p>
      `,
    },
  },

  /* --------------------- EDUCATIONAL OFFER -------------------- */
  educationalOfferAccepted: {
    es: {
      subject: '¡Tu oferta educativa ha sido aceptada!',
      html: ({ userName, offer }) => `
        <h2>¡Enhorabuena ${userName}!</h2>
        <p>Nos complace informarte que tu oferta educativa <strong>${offer.programName}</strong> ha sido revisada y aceptada.</p>
        <p>Ya está publicada en nuestra plataforma y los usuarios pueden verla.</p>
        <p>Detalles de la oferta:</p>
        <ul>
          <li><strong>Programa:</strong> ${offer.programName}</li>
          <li><strong>Institución:</strong> ${offer.institutionName}</li>
          <li><strong>Tipo:</strong> ${offer.educationType}</li>
          <li><strong>Modalidad:</strong> ${offer.modality}</li>
        </ul>
        <p>Puedes acceder a tu panel de control para gestionar tu oferta educativa.</p>
        <p>¡Gracias por confiar en nuestra plataforma!</p>
      `,
    },
    en: {
      subject: 'Your educational offer has been accepted!',
      html: ({ userName, offer }) => `
        <h2>Congratulations ${userName}!</h2>
        <p>We are pleased to inform you that your educational offer <strong>${offer.programName}</strong> has been reviewed and accepted.</p>
        <p>It is now published on our platform and users can view it.</p>
        <p>Offer details:</p>
        <ul>
          <li><strong>Program:</strong> ${offer.programName}</li>
          <li><strong>Institution:</strong> ${offer.institutionName}</li>
          <li><strong>Type:</strong> ${offer.educationType}</li>
          <li><strong>Modality:</strong> ${offer.modality}</li>
        </ul>
        <p>You can access your control panel to manage your educational offer.</p>
        <p>Thank you for trusting our platform!</p>
      `,
    },
  },

  educationalOfferRejected: {
    es: {
      subject: 'Actualización sobre tu oferta educativa',
      html: ({ userName, offer }) => `
        <h2>Hola ${userName}</h2>
        <p>Lamentamos informarte que tu oferta educativa <strong>${offer.programName}</strong> ha sido rechazada.</p>
        <p>Esto puede deberse a varios motivos:</p>
        <ul>
          <li>La oferta no cumple con nuestras políticas</li>
          <li>Falta información importante</li>
          <li>Contenido inapropiado</li>
        </ul>
        <p>Si tienes alguna duda o quieres más información, no dudes en contactar con nuestro equipo de soporte.</p>
        <p>Puedes revisar y modificar tu oferta para volver a enviarla.</p>
      `,
    },
    en: {
      subject: 'Update about your educational offer',
      html: ({ userName, offer }) => `
        <h2>Hi ${userName}</h2>
        <p>We are sorry to inform you that your educational offer <strong>${offer.programName}</strong> has been rejected.</p>
        <p>This may be due to several reasons:</p>
        <ul>
          <li>The offer does not comply with our policies</li>
          <li>Important information is missing</li>
          <li>Inappropriate content</li>
        </ul>
        <p>If you have any questions or want more information, feel free to contact our support team.</p>
        <p>You can review and edit your offer to resubmit it.</p>
      `,
    },
  },
};

/**
 * Devuelve { subject, html } para una clave y locale dados.
 * Fallback a español si la locale no existe o el template no la tiene.
 */
const getEmailTemplate = (key, locale, vars = {}) => {
  const loc = normalizeLocale(locale);
  const entry = templates[key];
  if (!entry) throw new Error(`Email template not found: ${key}`);
  const tpl = entry[loc] || entry.es;
  return {
    subject: tpl.subject,
    html: typeof tpl.html === 'function' ? tpl.html(vars) : tpl.html,
  };
};

/**
 * Resuelve la locale a partir de un objeto Express `req`.
 * Prioriza: body.locale → query.locale → header Accept-Language → 'es'.
 */
const resolveLocaleFromReq = (req) => {
  const raw =
    req?.body?.locale ||
    req?.query?.locale ||
    req?.headers?.['accept-language'] ||
    'es';
  // Accept-Language puede ser "en-US,en;q=0.9,es;q=0.8" → cogemos el primer token
  const first = String(raw).split(',')[0].trim();
  return normalizeLocale(first);
};

module.exports = { getEmailTemplate, normalizeLocale, resolveLocaleFromReq };
