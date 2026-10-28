// Etiquetas ya añadidas (software, habilidades): chips negros como los
// elegidos en el sheet de Especialización; clic en la × quita la etiqueta.
import { X } from "lucide-react";

export default function TagChips({ tags, onRemove, removeLabel }) {
  if (!tags.length) return null;
  return (
    <div className="pi-chips">
      {tags.map((tag, idx) => (
        <span key={`${tag}-${idx}`} className="pi-chip is-on">
          {tag}
          <button
            type="button"
            className="pi-chip-x"
            onClick={() => onRemove(idx)}
            aria-label={`${removeLabel} ${tag}`}
          >
            <X size={12} strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}
