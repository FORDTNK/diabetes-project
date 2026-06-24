# Running the project

This project has four runnable parts:

- `backend-ai`: FastAPI service on `http://127.0.0.1:8000`
- `backend-api`: Express admin API on `http://127.0.0.1:5000`
- `frontend`: static patient UI on `http://127.0.0.1:5500/login.html`
- `admin`: Vite admin UI on `http://127.0.0.1:5173`

## Requirements

- MySQL running on `127.0.0.1:3307`
- Database name: `diabetic_foot_ai`
- User/password from the existing env files: `root` / `root1234`
- Node.js and npm
- Python 3.11, or the existing `backend-ai\venv311`

## One-command start

From the project root:

```powershell
.\run-project.ps1
```

Or:

```bat
run-project.bat
```

To start everything except the admin frontend:

```powershell
.\run-project.ps1 -SkipAdmin
```

The script opens separate PowerShell windows for each service. Close those windows to stop the project.

## Manual start

```powershell
cd backend-ai
.\venv311\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```powershell
cd backend-api
npm start
```

```powershell
cd frontend
..\backend-ai\venv311\Scripts\python.exe -m http.server 5500 --bind 127.0.0.1
```

```powershell
cd admin
npm run dev -- --host 127.0.0.1 --port 5173
```
