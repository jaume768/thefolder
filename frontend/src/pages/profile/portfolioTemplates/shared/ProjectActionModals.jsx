// portfolioTemplates/shared/ProjectActionModals.jsx
// Modales de "reportar proyecto" y "eliminar proyecto" que abren las
// acciones rápidas (QuickActions) de las plantillas con páginas propias.
// Mismo diseño que el panel /myprofile/: "eliminar" es el ConfirmDialog de
// "Tus proyectos"/editor de proyecto (mismo copy editor.*), y "reportar"
// usa ese mismo marco (.pl-overlay/.pl-dialog, .pl-btn) con el textarea
// del editor (.pe-input/.pe-textarea). classPrefix se sigue aceptando para
// no tocar a los llamadores, pero ya no se usa.
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../../../components/controlPanel/proyectos/ConfirmDialog";
import "../../../../components/controlPanel/proyectos/ProjectsLibrary.css";
import "../../../../components/controlPanel/proyectos/ProjectEditor.css";

function ReportDialog({ reportReason, setReportReason, reportSubmitting, reportSent, onSubmit, onClose }) {
  const { t } = useTranslation("post");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="pl-overlay" onMouseDown={onClose}>
      <div
        className="pl-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pam-report-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {!reportSent ? (
          <>
            <h2 id="pam-report-title" className="pl-dialog-title">{t("view.report.title")}</h2>
            <p className="pl-dialog-text">{t("view.report.desc")}</p>
            <textarea
              className="pe-input pe-textarea"
              placeholder={t("view.report.placeholder")}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={500}
              rows={4}
              autoFocus
            />
            <p className="pl-dialog-text pam-notice">{t("view.report.notice")}</p>
            <div className="pl-dialog-actions">
              <button type="button" className="pl-btn pl-btn--grey pl-btn--lg" onClick={onClose}>
                {t("view.cancel")}
              </button>
              <button
                type="button"
                className="pl-btn pl-btn--black pl-btn--lg"
                onClick={onSubmit}
                disabled={!reportReason.trim() || reportSubmitting}
              >
                {reportSubmitting ? t("view.report.submitting") : t("view.report.submit")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="pam-report-title" className="pl-dialog-title">{t("view.report.sentTitle")}</h2>
            <p className="pl-dialog-text">{t("view.report.sentDesc")}</p>
            <div className="pl-dialog-actions">
              <button type="button" className="pl-btn pl-btn--black pl-btn--lg" onClick={onClose} autoFocus>
                {t("view.report.close")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectActionModals({
  showReportModal,
  reportReason,
  setReportReason,
  reportSubmitting,
  reportSent,
  onSubmitReport,
  onCloseReport,
  showDeleteModal,
  deletingProject,
  onConfirmDelete,
  onCloseDelete,
}) {
  const { t } = useTranslation("projects");

  return (
    <>
      {showReportModal && (
        <ReportDialog
          reportReason={reportReason}
          setReportReason={setReportReason}
          reportSubmitting={reportSubmitting}
          reportSent={reportSent}
          onSubmit={onSubmitReport}
          onClose={onCloseReport}
        />
      )}

      {showDeleteModal && (
        <ConfirmDialog
          title={t("editor.deleteTitle")}
          warning={t("editor.deleteText")}
          confirmLabel={t("editor.delete")}
          cancelLabel={t("editor.cancel")}
          onConfirm={onConfirmDelete}
          onCancel={onCloseDelete}
          busy={deletingProject}
        />
      )}
    </>
  );
}
