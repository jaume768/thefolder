import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CreatePost from "../../pages/post/CreatePostPage";
import "../controlPanel/css/CreatePostModal.css";

export default function CreatePostModal({ open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");

    // foco para accesibilidad
    setTimeout(() => dialogRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="cp-modal-backdrop" onMouseDown={onClose}>
      <div
        className="cp-modal-dialog"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()} // evita cerrar al clicar dentro
      >
        <CreatePost onClose={onClose} />
      </div>
    </div>,
    document.body
  );
}
