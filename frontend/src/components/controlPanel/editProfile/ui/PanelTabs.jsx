import React from "react";

// Diseño de pestañas compartido en /myprofile/edit (Community, Guardados,
// Proyectos, …) — antes solo vivía en Community como .mycomunity-tabs.
// `items`: [{ key, label }] — label puede ser cualquier ReactNode (texto,
// o texto + contador ya formateado por quien llama).
export default function PanelTabs({ items, activeTab, onChange }) {
  return (
    <div className="panel-tabs-wrapper">
      <div className="panel-tabs">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`panel-tab${activeTab === item.key ? " active" : ""}`}
            onClick={() => onChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
