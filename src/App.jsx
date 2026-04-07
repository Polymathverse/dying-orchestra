import { useState, useEffect, useRef, useCallback } from "react";
import { db, storage } from "./firebase.js";
import {
  collection, doc, setDoc, getDocs,
  deleteDoc, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from "firebase/storage";

/* ─── Fonts ─────────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,400&family=Space+Mono:wght@400;700&display=swap');`;

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root { min-height: 100vh; }

.app {
  min-height: 100vh;
  background: linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 40%, #e0f2f1 100%);
  color: #1b3a2d;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
}

.header {
  border-bottom: 1px solid #b2dfdb;
  padding: 18px 24px;
  display: flex;
  align-items: baseline;
  gap: 12px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-title {
  font-family: 'Spectral', serif;
  font-size: 17px;
  font-weight: 600;
  color: #1b5e3b;
  letter-spacing: 0.02em;
}
.header-sub {
  font-size: 11px;
  color: #4caf7d;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.screen {
  max-width: 500px;
  margin: 0 auto;
  padding: 32px 20px;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4caf7d;
  margin-bottom: 10px;
}
.title {
  font-family: 'Spectral', serif;
  font-size: 26px;
  font-weight: 600;
  color: #1b3a2d;
  line-height: 1.25;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 13px;
  color: #4a7a62;
  line-height: 1.6;
  margin-bottom: 28px;
}

.field-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4caf7d;
  margin-bottom: 6px;
}
.field-input {
  width: 100%;
  background: rgba(255,255,255,0.85);
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  color: #1b3a2d;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-bottom: 8px;
}
.field-input:focus {
  border-color: #26a96c;
  box-shadow: 0 0 0 3px rgba(38,169,108,0.12);
}
.field-input::placeholder { color: #a5c9b8; }

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #1b8a55;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  margin-top: 6px;
  box-shadow: 0 2px 8px rgba(27,138,85,0.25);
}
.btn-primary:hover {
  background: #157a48;
  box-shadow: 0 4px 14px rgba(27,138,85,0.35);
  transform: translateY(-1px);
}
.btn-primary:active { transform: scale(0.99) translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-ghost {
  background: rgba(255,255,255,0.6);
  border: 1px solid #b2dfdb;
  border-radius: 6px;
  padding: 8px 14px;
  color: #4a7a62;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}
.btn-ghost:hover {
  background: rgba(255,255,255,0.9);
  border-color: #80cbc4;
  color: #1b5e3b;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.5);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #b2dfdb;
}
.tab {
  flex: 1;
  padding: 9px;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: #80a898;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.04em;
}
.tab.active {
  background: #1b8a55;
  color: #fff;
  box-shadow: 0 1px 6px rgba(27,138,85,0.25);
}
.tab:hover:not(.active) {
  color: #1b5e3b;
  background: rgba(255,255,255,0.5);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.7);
  border: 1px solid #b2dfdb;
  border-radius: 8px;
}
.user-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #26a96c;
  flex-shrink: 0;
}
.user-email { color: #4a7a62; font-size: 11px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.record-zone {
  background: rgba(255,255,255,0.7);
  border: 1px solid #b2dfdb;
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(27,90,62,0.07);
}

.record-btn {
  width: 84px; height: 84px;
  border-radius: 50%;
  border: 2.5px solid #26a96c;
  background: #e8f5e9;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(38,169,108,0.2);
}
.record-btn:hover {
  border-color: #1b8a55;
  background: #c8e6c9;
  box-shadow: 0 4px 18px rgba(38,169,108,0.3);
}
.record-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.record-btn.recording {
  border-color: #e65100;
  background: #fff3e0;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230,81,0,0.25); }
  50% { box-shadow: 0 0 0 14px rgba(230,81,0,0); }
}

.record-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #26a96c;
  transition: all 0.3s;
}
.record-dot.recording {
  background: #e65100;
  border-radius: 5px;
  width: 22px; height: 22px;
}

.countdown { font-size: 34px; font-weight: 700; color: #e65100; font-family: 'Space Mono', monospace; margin-bottom: 6px; }
.countdown.idle { color: #4a7a62; font-size: 13px; }

canvas { width: 100%; height: 80px; border-radius: 8px; display: block; }

.recording-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e65100;
  margin-top: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}
.recording-label.visible { opacity: 1; }

.rec-item {
  background: rgba(255,255,255,0.75);
  border: 1px solid #b2dfdb;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(27,90,62,0.06);
}
.rec-item:hover { border-color: #80cbc4; background: rgba(255,255,255,0.95); box-shadow: 0 2px 10px rgba(27,90,62,0.1); }
.rec-item.playing { border-color: #26a96c; background: #f0faf4; }

.rec-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.rec-time { font-size: 10px; color: #80a898; letter-spacing: 0.06em; }
.rec-duration { font-size: 10px; color: #4a7a62; background: #e8f5e9; padding: 2px 7px; border-radius: 3px; border: 1px solid #b2dfdb; }
.rec-note { font-size: 13px; color: #1b3a2d; font-style: italic; }
.rec-note.empty { color: #a5c9b8; font-style: normal; }

.play-bar { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.play-progress { flex: 1; height: 4px; background: #b2dfdb; border-radius: 2px; overflow: hidden; }
.play-fill { height: 100%; background: #26a96c; border-radius: 2px; transition: width 0.4s linear; }
.play-time { font-size: 10px; color: #4a7a62; min-width: 32px; }

.delete-btn {
  background: transparent;
  border: none;
  color: #b2dfdb;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  transition: color 0.2s;
  line-height: 1;
}
.delete-btn:hover { color: #e53935; }

.empty-state { text-align: center; padding: 40px 0; color: #a5c9b8; font-size: 12px; line-height: 2; }

.error-box { background: #fff3f3; border: 1px solid #ffcdd2; border-radius: 8px; padding: 10px 14px; color: #c62828; font-size: 12px; margin-bottom: 14px; line-height: 1.5; }
.success-box { background: #f0faf4; border: 1px solid #a5d6a7; border-radius: 8px; padding: 10px 14px; color: #1b5e3b; font-size: 12px; margin-bottom: 14px; line-height: 1.5; }

.limit-bar { background: rgba(255,255,255,0.6); border: 1px solid #b2dfdb; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
.limit-track { flex: 1; height: 5px; background: #b2dfdb; border-radius: 3px; overflow: hidden; }
.limit-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.limit-text { font-size: 10px; color: #4a7a62; white-space: nowrap; }

.splash-quote { font-family: 'Spectral', serif; font-style: italic; font-size: 14px; color: #4a7a62; line-height: 1.7; margin-top: 28px; padding-top: 20px; border-top: 1px solid #b2dfdb; }
.splash-attr { font-size: 11px; color: #80a898; margin-top: 6px; font-style: normal; font-family: 'Space Mono', monospace; }

.spinner { width: 16px; height: 16px; border: 2px solid #b2dfdb; border-top-color: #26a96c; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; margin-right: 8px; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }

.upload-progress {
  background: rgba(255,255,255,0.6);
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 14px;
  font-size: 12px;
  color: #4a7a62;
}
.upload-track { height: 4px; background: #b2dfdb; border-radius: 2px; margin-top: 8px; overflow: hidden; }
.upload-fill { height: 100%; background: #26a96c; border-radius: 2px; transition: width 0.3s ease; }
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const MAX_RECORDINGS = 10;

function formatTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function formatDuration(secs) {
  const s = Math.round(secs || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function emailToKey(email) {
  return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, "_");
}

/* ─── Firebase helpers ───────────────────────────────────────────────────── */
async function fetchRecordings(email) {
  const colRef = collection(db, "recordings", emailToKey(email), "items");
  const q = query(colRef, orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function uploadRecording(email, blob, locationNote, duration) {
  const id = `rec_${Date.now()}`;
  const key = emailToKey(email);
  const ext = blob.type.includes("ogg") ? "ogg" : "webm";
  const storageRef = ref(storage, `recordings/${key}/${id}.${ext}`);

  await uploadBytes(storageRef, blob, { contentType: blob.type });
  const downloadURL = await getDownloadURL(storageRef);

  const docRef = doc(db, "recordings", key, "items", id);
  await setDoc(docRef, {
    timestamp: serverTimestamp(),
    locationNote: locationNote.trim() || "",
    duration,
    downloadURL,
    storagePath: storageRef.fullPath,
  });

  return { id, timestamp: new Date(), locationNote, duration, downloadURL, storagePath: storageRef.fullPath };
}

async function removeRecording(email, recId, storagePath) {
  const key = emailToKey(email);
  await deleteDoc(doc(db, "recordings", key, "items", recId));
  if (storagePath) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch (_) {}
  }
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("entry");
  const [tab, setTab] = useState("record");
  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [locationNote, setLocationNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [newBlob, setNewBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const countdownRef = useRef(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  /* ── Canvas drawing ── */
  const drawIdle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#f0faf4";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#b2dfdb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    ctx.fillStyle = "#f0faf4";
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1b8a55";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(27,138,85,0.3)";
    ctx.beginPath();
    const slice = W / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * H) / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += slice;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => drawIdle(), 80);
    return () => clearTimeout(t);
  }, [drawIdle]);

  /* ── Email submit ── */
  const handleEmailSubmit = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const recs = await fetchRecordings(trimmed);
      setRecordings(recs);
      setEmail(trimmed);
      setView("dashboard");
    } catch (e) {
      setError("Could not connect to database. Check your internet connection.");
      console.error(e);
    }
    setLoading(false);
  };

  /* ── Recording ── */
  const startRecording = async () => {
    setError("");
    setSuccess("");
    setNewBlob(null);
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        const dur = (Date.now() - startTimeRef.current) / 1000;
        setRecordingDuration(dur);
        setNewBlob(blob);
        cancelAnimationFrame(animFrameRef.current);
        drawIdle();
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(250);
      setIsRecording(true);
      setCountdown(30);
      drawWaveform();

      let secs = 30;
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) stopRecording();
      }, 1000);
    } catch {
      setError(
        "Microphone access denied. Please allow microphone access in your browser settings and try again."
      );
    }
  };

  const stopRecording = () => {
    clearInterval(countdownRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setCountdown(30);
  };

  /* ── Save recording to Firebase ── */
  const saveNewRecording = async () => {
    if (!newBlob) return;
    if (recordings.length >= MAX_RECORDINGS) {
      setError(`Archive full (${MAX_RECORDINGS} recordings max). Delete one to add more.`);
      return;
    }
    setSaving(true);
    setError("");
    setUploadPct(10);

    try {
      setUploadPct(30);
      const rec = await uploadRecording(email, newBlob, locationNote, recordingDuration);
      setUploadPct(100);
      setRecordings((prev) => [rec, ...prev]);
      setNewBlob(null);
      setLocationNote("");
      setSuccess("Recording saved to your archive.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      console.error(e);
      setError("Upload failed. Check your internet connection and try again.");
    }

    setUploadPct(0);
    setSaving(false);
  };

  const discardNewRecording = () => {
    setNewBlob(null);
    setLocationNote("");
    drawIdle();
  };

  /* ── Playback ── */
  const playRecording = (rec) => {
    if (audioRef.current) {
      audioRef.current.pause();
      clearInterval(progressRef.current);
    }
    if (playingId === rec.id) {
      setPlayingId(null);
      setPlayProgress(0);
      return;
    }
    const audio = new Audio(rec.downloadURL);
    audioRef.current = audio;
    setPlayingId(rec.id);
    setPlayProgress(0);
    audio.play().catch(() => setError("Playback failed. The file may still be processing."));

    progressRef.current = setInterval(() => {
      if (!audio.duration) return;
      const pct = Math.min((audio.currentTime / audio.duration) * 100, 100);
      setPlayProgress(pct);
      if (audio.ended || pct >= 100) {
        clearInterval(progressRef.current);
        setPlayingId(null);
        setPlayProgress(0);
      }
    }, 300);
  };

  /* ── Delete ── */
  const deleteRecording = async (rec) => {
    try {
      await removeRecording(email, rec.id, rec.storagePath);
      setRecordings((prev) => prev.filter((r) => r.id !== rec.id));
      if (playingId === rec.id) {
        audioRef.current?.pause();
        clearInterval(progressRef.current);
        setPlayingId(null);
        setPlayProgress(0);
      }
    } catch {
      setError("Could not delete recording. Try again.");
    }
  };

  /* ── Sign out ── */
  const signOut = () => {
    audioRef.current?.pause();
    clearInterval(progressRef.current);
    setView("entry");
    setEmail("");
    setEmailInput("");
    setRecordings([]);
    setNewBlob(null);
    setError("");
    setSuccess("");
    setTab("record");
  };

  const limitPct = (recordings.length / MAX_RECORDINGS) * 100;
  const limitColor =
    recordings.length >= MAX_RECORDINGS
      ? "#c62828"
      : recordings.length >= MAX_RECORDINGS - 2
      ? "#e65100"
      : "#1b8a55";

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{FONTS}{css}</style>
      <div className="app">

        {/* Header */}
        <div className="header">
          <span className="header-title">The Dying Orchestra</span>
          <span className="header-sub">Soundscape Archive · Earth Day 2026</span>
        </div>

        {/* ── Entry screen ── */}
        {view === "entry" && (
          <div className="screen">
            <div className="eyebrow">Field Recording Station</div>
            <div className="title">What do you still hear?</div>
            <div className="subtitle">
              Record 30 seconds of where you are right now. Your recording joins a
              living acoustic map of the Hamline campus and Twin Cities area.
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="field-label">Your email — to retrieve recordings later</div>
            <input
              className="field-input"
              type="email"
              placeholder="you@hamline.edu"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              autoComplete="email"
            />

            <button
              className="btn-primary"
              onClick={handleEmailSubmit}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" />loading your archive…</>
              ) : (
                "Enter archive →"
              )}
            </button>

            <div className="splash-quote">
              "In healthy ecosystems, species occupy distinct, non-overlapping
              acoustic frequencies — they evolved to coexist acoustically. When
              that architecture collapses, everything collapses with it."
              <div className="splash-attr">— Bernie Krause, acoustic ecologist</div>
            </div>
          </div>
        )}

        {/* ── Dashboard ── */}
        {view === "dashboard" && (
          <div className="screen">

            {/* User chip */}
            <div className="user-chip">
              <div className="user-dot" />
              <span className="user-email">{email}</span>
              <button className="btn-ghost" onClick={signOut}>sign out</button>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${tab === "record" ? "active" : ""}`}
                onClick={() => setTab("record")}
              >
                Record
              </button>
              <button
                className={`tab ${tab === "archive" ? "active" : ""}`}
                onClick={() => setTab("archive")}
              >
                Archive {recordings.length > 0 ? `(${recordings.length})` : ""}
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">{success}</div>}

            {/* ── Record tab ── */}
            {tab === "record" && (
              <>
                <div className="record-zone">
                  <button
                    className={`record-btn ${isRecording ? "recording" : ""}`}
                    onClick={isRecording ? stopRecording : (!newBlob ? startRecording : undefined)}
                    disabled={!!newBlob || saving}
                    title={isRecording ? "Stop recording" : "Start recording"}
                  >
                    <div className={`record-dot ${isRecording ? "recording" : ""}`} />
                  </button>

                  <div className={isRecording ? "countdown" : "countdown idle"}>
                    {isRecording
                      ? `${countdown}s`
                      : newBlob
                      ? `${formatDuration(recordingDuration)} recorded`
                      : "Press to record"}
                  </div>

                  <canvas ref={canvasRef} width={400} height={80} style={{ marginTop: 12 }} />

                  <div className={`recording-label ${isRecording ? "visible" : ""}`}>
                    ● RECORDING — tap to stop early
                  </div>
                </div>

                {/* Saving progress */}
                {saving && (
                  <div className="upload-progress">
                    <span className="spinner" />Uploading to archive…
                    <div className="upload-track">
                      <div className="upload-fill" style={{ width: `${uploadPct}%` }} />
                    </div>
                  </div>
                )}

                {/* Post-record form */}
                {newBlob && !saving && (
                  <>
                    <div className="field-label">Where are you right now? (optional)</div>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="e.g. outside Anderson Center, Hamline campus"
                      value={locationNote}
                      onChange={(e) => setLocationNote(e.target.value)}
                      maxLength={100}
                    />
                    <button className="btn-primary" onClick={saveNewRecording}>
                      Save to archive →
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ width: "100%", marginTop: 8, textAlign: "center" }}
                      onClick={discardNewRecording}
                    >
                      discard recording
                    </button>
                  </>
                )}

                {/* Instructions */}
                {!newBlob && !isRecording && !saving && (
                  <div style={{ marginTop: 16 }}>
                    <div className="field-label" style={{ marginBottom: 10 }}>How it works</div>
                    <div style={{ color: "#4a7a62", lineHeight: 2, fontSize: 12 }}>
                      1 · Press the circle above to begin<br />
                      2 · Hold still — let the ambient sound fill the mic<br />
                      3 · Recording stops automatically at 30 seconds<br />
                      4 · Label your location and save to the shared archive
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Archive tab ── */}
            {tab === "archive" && (
              <>
                <div className="limit-bar">
                  <span className="limit-text">{recordings.length}/{MAX_RECORDINGS}</span>
                  <div className="limit-track">
                    <div className="limit-fill" style={{ width: `${limitPct}%`, background: limitColor }} />
                  </div>
                  <span className="limit-text">recordings</span>
                </div>

                {recordings.length === 0 && (
                  <div className="empty-state">
                    No recordings yet.<br />
                    Switch to the Record tab to capture your first soundscape.
                  </div>
                )}

                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className={`rec-item ${playingId === rec.id ? "playing" : ""}`}
                    onClick={() => playRecording(rec)}
                  >
                    <div className="rec-meta">
                      <span className="rec-time">{formatTime(rec.timestamp)}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span className="rec-duration">{formatDuration(rec.duration)}</span>
                        <button
                          className="delete-btn"
                          onClick={(e) => { e.stopPropagation(); deleteRecording(rec); }}
                          title="Delete recording"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className={`rec-note ${rec.locationNote ? "" : "empty"}`}>
                      {rec.locationNote || "no location noted"}
                    </div>

                    {playingId === rec.id && (
                      <div className="play-bar">
                        <span style={{ color: "#26a96c", fontSize: 12 }}>▶</span>
                        <div className="play-progress">
                          <div className="play-fill" style={{ width: `${playProgress}%` }} />
                        </div>
                        <span className="play-time">
                          {formatDuration((playProgress / 100) * rec.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
