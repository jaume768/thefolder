# Checklist: añadir una nueva plantilla de perfil

Cada vez que se crea un nuevo template de perfil hay que tocar **6 sitios** en un orden concreto.
Si falta cualquiera de ellos la plantilla no se guarda, no se muestra, o ambas cosas.

---

## 1. Modelo Mongoose — `backend/models/User.js`

```js
profileLayout: {
  type: String,
  enum: ["default", "index-gallery", "studio-gallery", "daisy-film", /* ← nuevo */],
  default: "default",
},
```

**Este es el paso más fácil de olvidar.** Si el valor no está en el `enum`, Mongoose lo rechaza
silenciosamente: el controlador devuelve 200 OK pero el campo nunca se escribe en MongoDB.
Síntoma: seleccionas la plantilla, guardas, recargas → vuelve a la anterior.

---

## 2. Controlador — `backend/controllers/userController.js`

Busca la whitelist del campo `profileLayout` (≈ línea 224) y añade la clave:

```js
if (["default", "index-gallery", "studio-gallery", "daisy-film", /* ← nuevo */].includes(v))
  updates.profileLayout = v;
else delete updates.profileLayout;
```

Sin esto el controlador elimina el valor del payload antes de llegar a Mongoose.

---

## 3. Componente de la plantilla — `frontend/src/pages/profile/`

Crea `ProfileNombrePlantilla.jsx` y `ProfileNombrePlantilla.css`.

- Recibe las mismas props que los otros templates:
  `profile, userPosts, postsLoading, isOwner, isFollowing, followLoading,`
  `handleFollow, handleUnfollow, isLoggedIn, isCompany, isEducationalInstitution`
- El `seoHelmet` lo inyecta `UserProfilePage` como hermano (`<>{seoHelmet}<Componente/></>`),
  no hace falta construirlo dentro del template.
- Si usa hijos con `position: absolute` en la miniatura de preview,
  asegúrate de que el contenedor padre tenga `position: relative; overflow: hidden`.

---

## 4. Ruteo — `frontend/src/pages/profile/UserProfilePage.jsx`

Añade el import y un bloque `if` **antes** del layout por defecto:

```jsx
import ProfileNombrePlantilla from "./ProfileNombrePlantilla";

// ── Layout alternativo: Nombre Plantilla
if (profile?.profileLayout === "nombre-clave" || layoutParam === "alias") {
  return (
    <>
      {seoHelmet}
      <ProfileNombrePlantilla
        profile={profile}
        userPosts={userPosts}
        postsLoading={postsLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOwner={isOwner}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
        isLoggedIn={isLoggedIn}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
      />
    </>
  );
}
```

El `layoutParam` permite previsualizar sin guardar: `?layout=alias`.

---

## 5. Selector de apariencia — `frontend/src/components/controlPanel/editProfile/tabs/ProfileAppearanceTab.jsx`

Añade un botón `ux-template-card ux-gallery-option` dentro de `<div className="ux-gallery-options">`:

```jsx
<button
  type="button"
  className={`ux-template-card ux-gallery-option ${profileLayout === "nombre-clave" ? "is-selected" : ""}`}
  onClick={() => setProfileLayout("nombre-clave")}
>
  <div className="ux-layout-preview ux-layout-preview--nombre">
    {/* miniatura: si usas hijos position:absolute, el div padre necesita position:relative */}
  </div>
  <div className="ux-gallery-option-label">Nombre visible</div>
  <div className="ux-gallery-option-desc">{t("editProfile.nombreDesc")}</div>
  {profileLayout === "nombre-clave" && <div className="ux-template-check">✓</div>}
</button>
```

---

## 6. Traducciones — `frontend/src/i18n/locales/`

En `en/profile.json` y `es/profile.json`, dentro del objeto `editProfile`:

```json
"nombreDesc": "Descripción corta de la plantilla."
```

---

## Orden recomendado

```
1. User.js (enum)          ← sin esto nada persiste
2. userController.js       ← sin esto el valor se descarta antes de llegar a Mongo
3. ProfileNombrePlantilla.jsx + .css
4. UserProfilePage.jsx     (import + bloque if)
5. ProfileAppearanceTab.jsx (botón selector)
6. profile.json EN + ES    (descripción)
```

---

## Clave de referencia: valores de `profileLayout`

| Clave             | Componente               | Preview param |
|-------------------|--------------------------|---------------|
| `default`         | layout clásico (inline)  | —             |
| `studio-gallery`  | ProfileStudioGallery     | `?layout=studio` |
| `index-gallery`   | ProfileIndexGallery      | `?layout=index`  |
| `daisy-film`      | ProfileDaisyFilm         | `?layout=daisy`  |
