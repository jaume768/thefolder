# Daily startup guide (local development)

How to start and stop TheFolder on your laptop to work on it.
Since October 2026 you **no longer need** `docker compose up -d --build` to see changes:
save a file and the browser updates by itself.

---

## ☀️ Starting the project (every morning)

**1. Turn on the laptop and open Docker Desktop**, the app with the whale 🐳.
Wait until the bottom-left corner says **"Engine running"** in green. It can take 30 seconds to a minute.

**2. Open VS Code** with the `thefolder-prod` folder.

**3. Open Terminal 1:** top menu **Terminal → New Terminal**.

**4. In Terminal 1, type each line and press `Enter`:**
```
docker stop frontend backend admin
```
```
docker compose up -d mongo
```
```
cd backend
```
```
npm run dev
```
⏳ Wait until you see **`MongoDB conectado`**.
🚫 Don't type anything else in this terminal, and don't close it.

**5. Open Terminal 2:** click the **+** at the top right of the terminal panel.

**6. In Terminal 2, type each line and press `Enter`:**
```
cd frontend
```
```
npm run dev
```
⏳ Wait until you see **`Local: http://localhost:3000/`**.
🚫 Don't close this one either.

**7. Open your browser at http://localhost:3000.** ✅ Ready to work.

While you work, just **save your files** (`Ctrl` + `S`) and the browser updates by itself.

> Admin panel (only if you need it): open a **Terminal 3** with the **+**, then type
> `cd frontend-admin` and `npm run dev`. It opens on http://localhost:3001.

---

## 🌙 Closing for the day

**1. Click on Terminal 1**, press `Ctrl` + `C`.
If it asks something like *"¿Desea terminar el trabajo por lotes (S/N)?"*, type `S` and press `Enter`.

**2. Click on Terminal 2**, and do the same: `Ctrl` + `C`, then `S` and `Enter` if asked.

**3. Close VS Code.**

**4. Close Docker Desktop:** right-click the whale 🐳 in the bottom-right corner of Windows (near the clock) and choose **Quit Docker Desktop**.

**5. Turn off the laptop.** 💤

Your data is safe. The database keeps everything between days.

---

## 🆘 If something goes wrong

| What you see | What to do |
|---|---|
| `docker: command not found` or "cannot connect" | Docker Desktop isn't open or not ready yet. Open it, wait for green, try again |
| `No such container` | Ignore it, it's fine. Continue with the next line |
| `Port already in use` / `EADDRINUSE` | Something is still running. Close VS Code completely, open it again, and start from step 3 |
| `Cannot find path` after `cd` | Close that terminal (🗑️ trash icon), open a new one, start that step again |
| Page is blank or acts strangely | Press `F12` → **Console**, copy the red lines and send them to Claude |
| Anything else in red | Copy it and paste it to Claude |

---

## ℹ️ Good to know

- **Local data is separate from the real site.** Your laptop has its own copy of the database.
  Posts, profile edits and accounts you change on `localhost` **do not appear on thefolder.es**.
- **Your local password may be different** from your real one. If login fails, use
  "¿Olvidaste tu contraseña?" on localhost. It only changes the local password.
- **Uploaded images go to the real image storage** (the S3 bucket `fotos-the-folder`), even from localhost.
  They don't show up on the real site, but they do take up space. Use small test images and don't upload too many.
- **The old way still works:** `docker compose up -d --build` builds the production version.
  Use it only to check everything before Jaume deploys.
- **Undoing the October 2026 setup:** see `backups/dev-setup-2026-10-04/README.md`.
