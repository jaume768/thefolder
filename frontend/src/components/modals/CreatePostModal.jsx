// components/modals/CreatePostModal.jsx
// "Subir proyecto" (botón Publicar / "+", AppLayout.jsx): el MISMO modal que
// editar un proyecto (ProjectEditor en mode="create", pl-overlay
// pe-modal-overlay), así subir y editar se ven y funcionan igual. Paso 1 =
// imágenes y datos; paso 2 = tags + derechos de imagen. ProjectEditor ya se
// pinta en un portal, gestiona Escape, el foco y el aviso de salir sin
// publicar. La antigua página de subida (pages/post/CreatePostPage.jsx) ya
// no se usa desde aquí.
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProjectEditor from "../controlPanel/proyectos/ProjectEditor";

export default function CreatePostModal({ open, onClose }) {
  if (!open) return null;
  return <ProjectEditor variant="modal" mode="create" onClose={onClose} />;
}

// Ruta /createPost (enlaces antiguos o directos): abre el mismo modal; al
// cerrarlo vuelve atrás, o al explorador si se entró directamente. Tras
// publicar, el editor ya ha navegado al proyecto: entonces no se vuelve.
export function CreatePostRoute() {
  const navigate = useNavigate();
  const published = useRef(false);
  const close = () => {
    if (published.current) return;
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/explorer", { replace: true });
  };
  return (
    <ProjectEditor
      variant="modal"
      mode="create"
      onSaved={() => { published.current = true; }}
      onClose={close}
    />
  );
}
