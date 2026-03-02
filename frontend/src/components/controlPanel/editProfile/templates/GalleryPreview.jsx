// GalleryPreview.jsx — preview masonry estilo pinterest con bloques de color
import React from "react";

// Bloques con alturas variadas para simular imágenes reales
const BLOCKS = [
  { h: 120, color: "#d4d4d4" },
  { h: 80,  color: "#e8e8e8" },
  { h: 150, color: "#c8c8c8" },
  { h: 90,  color: "#e0e0e0" },
  { h: 110, color: "#d0d0d0" },
  { h: 70,  color: "#e4e4e4" },
  { h: 130, color: "#cacaca" },
  { h: 85,  color: "#dcdcdc" },
];

// Distribuir bloques en N columnas
const distributeColumns = (blocks, numCols) => {
  const cols = Array.from({ length: numCols }, () => []);
  blocks.forEach((block, i) => {
    cols[i % numCols].push(block);
  });
  return cols;
};

export default function GalleryPreview({ nogap = false }) {
  const gap = nogap ? 0 : 18;
  const cols = distributeColumns(BLOCKS, 3);

  return (
    <div
      className="ux-gallery-masonry-preview"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: gap,
        width: "100%",
        overflow: "hidden",
        borderRadius: nogap ? 0 : 4,
      }}
    >
      {cols.map((col, ci) => (
        <div
          key={ci}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: gap,
          }}
        >
          {col.map((block, bi) => (
            <div
              key={bi}
              style={{
                width: "100%",
                height: block.h,
                background: block.color,
                borderRadius: nogap ? 0 : 2,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}