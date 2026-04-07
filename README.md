# The Dying Orchestra — Soundscape Archive
## Earth Day 2026 · Hamline University

A field recording web app for the exhibit. Students scan a QR code, record
30 seconds of ambient sound, and contribute to a shared acoustic map of campus.
Recordings are stored in Firebase Storage; metadata lives in Firestore.

---

## Stack
- React 18 + Vite
- Firebase 10 (Firestore + Storage)
- Docker + Nginx
- Google Cloud Run (hosting)

---

## Deploy in 5 steps with Claude Code

Open Claude Code in this folder, then run through these steps:

### Step 1 — Install dependencies and test locally
```
npm install
npm run dev
```
Visit http://localhost:3000 to verify the app works.

### Step 2 — Set up Firebase rules
```
npm install -g firebase-tools
firebase login
firebase use dying-orchestra
firebase deploy --only firestore:rules,storage
```

### Step 3 — Enable Google Cloud APIs
```
gcloud config set project dying-orchestra
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### Step 4 — Build and push Docker image
```
gcloud artifacts repositories create dying-orchestra \
  --repository-format=docker \
  --location=us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/dying-orchestra/dying-orchestra/app
```

### Step 5 — Deploy to Cloud Run
```
gcloud run deploy dying-orchestra \
  --image us-central1-docker.pkg.dev/dying-orchestra/dying-orchestra/app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

Cloud Run prints a URL like:
  https://dying-orchestra-xxxxxxxxx-uc.a.run.app

**That URL goes in your QR code.**

---

## Firebase console checklist
Before deploying, confirm in https://console.firebase.google.com:
- [ ] Firestore Database created (Start in test mode)
- [ ] Storage bucket enabled (Start in test mode)
- [ ] Both rules deployed (Step 2 above)

---

## Project structure
```
dying-orchestra/
├── src/
│   ├── main.jsx        React entry point
│   ├── App.jsx         Main component + all UI
│   └── firebase.js     Firebase config and init
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
├── nginx.conf
├── firestore.rules
└── storage.rules
```
