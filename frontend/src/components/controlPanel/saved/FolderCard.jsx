import React, { useId } from 'react';
import { PenLine } from 'lucide-react';
import './FolderCard.css';

// Path de la carpeta (esquinas un poco más redondeadas, pestaña arriba a la
// izquierda). viewBox calculado a partir de las coordenadas del path (~1000x670).
// Exportado: PageMosaicCard (proyectos/) reutiliza esta misma silueta para su
// propio trigger "+ nueva página" (mismo lenguaje visual que crear carpeta).
export const FOLDER_PATH = "M980,84H466c-9,0-17.7-3.2-24.6-9L369,14c-6.9-5.8-15.6-9-24.6-9H25c-11.1,0-20,8.9-20,20v616c0,7.7,6.3,14,14,14h962c7.7,0,14,-6.3,14,-14V97C995,89.9,989.2,84,982,84Z";

const PEEK_ROTATE = [-8, 0, 8];
const PEEK_X_OFFSET = [-140, 0, 140];
// La imagen central (sin rotar, la que va encima) asoma 6px más arriba que
// las otras dos, para que se note que está delante del abanico.
const PEEK_Y_OFFSET = [0, -6, 0];
// Orden de pintado dentro del <g> — la del medio (sin rotar) va última para
// quedar por encima de las otras dos, igual que el z-index del diseño previo.
const PEEK_PAINT_ORDER = [0, 2, 1];

// Ancho/alto de cada imagen dentro de la silueta — ya no atados a un ratio
// 4:3 fijo (preserveAspectRatio="slice" recorta igual el origen sea cual sea
// la caja): un poco menos de ancho combinado entre las tres (~2-4px al
// tamaño típico de tarjeta) y un poco más de alto que antes (402 → 430).
const PEEK_IMG_W = 524;
const PEEK_IMG_H = 430;
const PEEK_IMG_X_BASE = (1000 - PEEK_IMG_W) / 2;
// tallCenter: alto de la imagen central. Crece hacia arriba desde el mismo
// borde inferior que las laterales (apoyada en el fondo de la carpeta).
const PEEK_IMG_H_TALL = 516;

// Carpeta real: tarjeta blanca sin fondo de pestaña. Nombre + contador
// centrados debajo del icono. Hasta 3 imágenes en abanico, recortadas a la
// silueta exacta de la carpeta (clipPath) — ya no son <img> flotando encima,
// sino contenido del propio <svg>. Editar/borrar quedan como iconos que solo
// aparecen al hover, arriba a la derecha del icono.
export default function FolderCard({
  name,
  count,
  images = [],
  onClick,
  onEdit,
  onDelete,
  deleteLabel,
  editLabel,
  isEditing = false,
  editValue = '',
  onEditChange,
  onEditSubmit,
  onEditCancel,
  // flatImages: imágenes sin borde blanco y con esquinas rectas (home del
  // panel). Por defecto, borde blanco + esquinas de 8 como en Guardados.
  flatImages = false,
  // tallCenter: la imagen central más alta, para que asome por encima de las
  // esquinas superiores de las dos laterales (home del panel). Apoyada en el
  // fondo de la carpeta, como las otras dos.
  tallCenter = false,
}) {
  const imgRadius = flatImages ? 0 : 8;
  const peekImages = images.slice(0, 3);
  const peekSlots = PEEK_PAINT_ORDER.filter((i) => i < peekImages.length);
  const clipId = useId();

  return (
    <div
      className="gf-folder gf-folder--peek"
      role="button"
      tabIndex={0}
      onClick={isEditing ? undefined : onClick}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick?.(); }
      }}
    >
      <div className="gf-folder-visual">
        <svg className="gf-folder-shape" viewBox="0 0 1000 670" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <path d={FOLDER_PATH} />
            </clipPath>
          </defs>

          <path d={FOLDER_PATH} />

          {peekImages.length > 0 && (
            <g clipPath={`url(#${clipId})`}>
              {peekSlots.map((i) => {
                const src = peekImages[i];
                const isTallCenter = tallCenter && i === 1;
                const h = isTallCenter ? PEEK_IMG_H_TALL : PEEK_IMG_H;
                const x = PEEK_IMG_X_BASE + PEEK_X_OFFSET[i];
                const y = (670 - h) + (isTallCenter ? 0 : (PEEK_Y_OFFSET[i] ?? 0));
                const pivotX = x + PEEK_IMG_W / 2;
                const pivotY = y + h;
                const imgClipId = `${clipId}-img-${i}`;
                // Cada imagen con su propio borde blanco + esquinas casi rectas
                // (equivalente SVG de border:1px solid #fff; border-radius:2px —
                // no hay "border" real en <image>, así que se simula con un
                // clip propio en rx/ry y un <rect> sin relleno encima).
                return (
                  <g key={i} transform={`rotate(${PEEK_ROTATE[i] ?? 0} ${pivotX} ${pivotY})`}>
                    <defs>
                      <clipPath id={imgClipId}>
                        <rect x={x} y={y} width={PEEK_IMG_W} height={h} rx={imgRadius} ry={imgRadius} />
                      </clipPath>
                    </defs>
                    <image
                      href={src}
                      xlinkHref={src}
                      x={x}
                      y={y}
                      width={PEEK_IMG_W}
                      height={h}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#${imgClipId})`}
                    />
                    {!flatImages && (
                      <rect
                        x={x}
                        y={y}
                        width={PEEK_IMG_W}
                        height={h}
                        rx={imgRadius}
                        ry={imgRadius}
                        fill="none"
                        stroke="#fff"
                        strokeWidth="4"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      <div className="gf-folder-label">
        {isEditing ? (
          <input
            type="text"
            className="gf-folder-rename-input"
            value={editValue}
            onChange={onEditChange}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            onBlur={onEditSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); onEditSubmit(e); }
              if (e.key === 'Escape') { e.preventDefault(); onEditCancel(); }
            }}
          />
        ) : (
          <span className="gf-folder-name">{name}</span>
        )}
        <span className="gf-folder-count">{count}</span>
      </div>

      {(onEdit || onDelete) && !isEditing && (
        <div className="gf-folder-hover-actions">
          {onEdit && (
            <button
              type="button"
              className="gf-folder-hover-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(e); }}
              aria-label={editLabel}
            >
              <PenLine size={12} strokeWidth={1.8} aria-hidden="true" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="gf-folder-hover-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              aria-label={deleteLabel}
            >
              <img src="/iconos/bin.png" alt="" style={{ width: 10 }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Mismo hueco en el grid que ocupaba antes la carpeta punteada — ahora se
// entra en este modo desde el botón fijo abajo a la derecha (GuardadosPage.jsx).
export function FolderCardCreateForm({
  value,
  onChange,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  placeholder,
  disabled,
  // Guardados usa el icono de carpeta (rectángulo ~1000x670, igual que
  // .gf-folder--peek) — PageMosaicCard.jsx (páginas del portfolio) reutiliza
  // este mismo formulario, pero ahí las tarjetas reales son cuadradas
  // (.gf-folder-preview, aspect-ratio 1/1); con el icono de carpeta se veía
  // como un rectángulo ancho al lado de miniaturas cuadradas. `mosaic`
  // cambia el icono por el mismo cuadro punteado cuadrado que ya usa
  // PageMosaicCardCreate (.gf-folder-preview--dashed) para que mida igual
  // que sus vecinas — el resto (input, botones) no cambia.
  mosaic = false,
}) {
  return (
    <div
      className={`gf-folder gf-folder--dashed gf-folder--form${mosaic ? ' gf-folder--form-mosaic' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {mosaic ? (
        <div className="gf-folder-preview gf-folder-preview--dashed" aria-hidden="true" />
      ) : (
        <svg className="gf-folder-shape" viewBox="0 0 1000 670" aria-hidden="true">
          <rect x="0" y="0" width="1000" height="670" rx="24" ry="24" />
        </svg>
      )}
      <div className="gf-folder-form-content">
        <input
          type="text"
          className="gf-folder-form-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onConfirm(); }
            if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
          }}
        />
        <div className="gf-folder-form-actions">
          <button type="button" className="gf-folder-form-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="gf-folder-form-confirm" onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
