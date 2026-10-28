import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileAppearanceTab from "../../../components/controlPanel/editProfile/tabs/ProfileAppearanceTab";
import { useProfileDraft } from "../../../contexts/ProfileDraftContext";

const DEFAULT_TEMPLATE_ID = "fullscreen";

export default function PlantillasPage() {
  const { t } = useTranslation("profile");
  const {
    draft, setDraftField, setIsDirty,
    isCompany, isEducationalInstitution,
    uploadHeaderVariant, deleteHeaderVariant,
  } = useProfileDraft();

  // Tabs SOLO para la sección Plantillas
  // "portada" | "galeria" — no usado directamente aquí (ProfileAppearanceTab
  // lo gestiona con coverView), se deja fuera si no hace falta.

  // Dentro de Plantillas > Portada: selector de preview
  const [coverView, setCoverView] = useState("desktop"); // "desktop" | "mobile"

  // selección local (solo UI) de plantilla elegida — al montar, este
  // componente ya vive detrás del `if (!draft) return null` del router
  // (ver ProfileEditPage.jsx), así que draft ya trae el valor real guardado.
  const [selectedTemplateDesktop, setSelectedTemplateDesktop] = useState(
    () => draft?.coverTemplateDesktop || DEFAULT_TEMPLATE_ID
  );
  const [selectedTemplateMobile, setSelectedTemplateMobile] = useState(
    () => draft?.coverTemplateMobile || DEFAULT_TEMPLATE_ID
  );

  const selectTemplate = (tplId) => {
    const chosen = tplId || DEFAULT_TEMPLATE_ID;

    if (coverView === "desktop") {
      setSelectedTemplateDesktop(chosen);
      setDraftField("coverTemplateDesktop", chosen);
    } else {
      setSelectedTemplateMobile(chosen);
      setDraftField("coverTemplateMobile", chosen);
    }

    setIsDirty(true);
  };

  const headerDesktopFileRef = useRef(null);
  const headerMobileFileRef = useRef(null);

  // Opciones mock (solo UI por ahora)
  const MOCK_TEMPLATES = useMemo(() => [
    {
      id: "fullscreen",
      title: t("editProfile.templates.fullscreen"),
      subtitle: t("editProfile.templates.fullscreenSubtitle"),
      supportedViews: ["desktop", "mobile"],
    },
    {
      id: "fullscreen-alt",
      title: t("editProfile.templates.fullscreenAlt"),
      subtitle: t("editProfile.templates.fullscreenAltSubtitle"),
      supportedViews: ["desktop", "mobile"],
    },
    {
      id: "centered",
      title: t("editProfile.templates.centered"),
      subtitle: t("editProfile.templates.centeredSubtitle"),
      supportedViews: ["desktop"],
    },
    {
      id: "vertical-editorial",
      title: t("editProfile.templates.verticalEditorial"),
      subtitle: t("editProfile.templates.verticalEditorialSubtitle"),
      supportedViews: ["desktop"],
    },
    {
      id: "vertical-centered",
      title: t("editProfile.templates.verticalCentered"),
      subtitle: t("editProfile.templates.verticalCenteredSubtitle"),
      supportedViews: ["desktop"],
    },
    {
      id: "split-top",
      title: t("editProfile.templates.splitTop"),
      subtitle: t("editProfile.templates.splitTopSubtitle"),
      supportedViews: ["desktop"],
    },
    {
      id: "split-image",
      title: t("editProfile.templates.splitImage"),
      subtitle: t("editProfile.templates.splitImageSubtitle"),
      supportedViews: ["mobile"],
    },
    {
      id: "vertical-card",
      title: t("editProfile.templates.verticalCard"),
      subtitle: t("editProfile.templates.verticalCardSubtitle"),
      supportedViews: ["mobile"],
    },
  ], [t]);

  const coverPreviewImage =
    coverView === "desktop"
      ? (draft?.featuredHeaderImageDesktop || "")
      // Mobile sin portada propia: la de desktop, como en el hero real.
      : (draft?.featuredHeaderImageMobile || draft?.featuredHeaderImageDesktop || "");

  return (
    <div className="nep-tab-body nep-tab-body--appearance">
      <ProfileAppearanceTab
        // --- datos base
        draft={draft}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}

        // --- cover view + templates
        coverView={coverView}
        setCoverView={setCoverView}
        MOCK_TEMPLATES={MOCK_TEMPLATES}
        selectTemplate={selectTemplate}
        selectedTemplateDesktop={selectedTemplateDesktop}
        selectedTemplateMobile={selectedTemplateMobile}
        coverPreviewImage={coverPreviewImage}

        // --- refs
        headerDesktopFileRef={headerDesktopFileRef}
        headerMobileFileRef={headerMobileFileRef}

        // --- uploads
        uploadHeaderVariant={uploadHeaderVariant}
        deleteHeaderVariant={deleteHeaderVariant}

        galleryStyle={draft?.galleryStyle || "gap"}
        setGalleryStyle={(val) => {
          setDraftField("galleryStyle", val);
          setIsDirty(true);
        }}

        juneStampGalleryMode={draft?.juneStampGalleryMode || "projects"}
        setJuneStampGalleryMode={(val) => {
          setDraftField("juneStampGalleryMode", val);
          setIsDirty(true);
        }}

        // Punto de enfoque de la portada (diálogo "Imagen de portada"):
        // { x, y } en %, o null para volver al encuadre por defecto.
        setHeaderFocus={(variant, focus) => {
          setDraftField(variant === "desktop" ? "featuredHeaderFocusDesktop" : "featuredHeaderFocusMobile", focus);
          setIsDirty(true);
        }}

        profileLayout={draft?.profileLayout || "default"}
        setProfileLayout={(val) => {
          setDraftField("profileLayout", val);
          setIsDirty(true);
        }}
      />
    </div>
  );
}
