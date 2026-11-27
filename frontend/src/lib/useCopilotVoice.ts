"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { synthesizeVoiceSpeech, transcribeVoiceAudio } from "@/lib/apiServices";
import type { PromptVoiceStatus } from "@/components/prompt/PromptBar";

const VOICE_MODE_STORAGE_KEY = "copilot_voice_mode";
const VOICE_LANG_STORAGE_KEY = "copilot_voice_lang";
const MAX_RECORDING_SECONDS = 90;

export type VoiceLanguage = "auto" | "bn" | "en";

interface SupportedAudioFormat {
  mimeType: string;
  ext: string;
}

function extFromMime(mime: string, fallbackExt: string): string {
  const clean = mime.split(";")[0].trim().toLowerCase();
  if (clean === "audio/mp4" || clean === "audio/m4a" || clean === "audio/x-m4a" || clean === "audio/aac") {
    return "m4a";
  }
  if (clean === "audio/ogg" || clean === "application/ogg" || clean === "audio/opus") {
    return "ogg";
  }
  if (clean === "audio/webm" || clean === "video/webm") {
    return "webm";
  }
  if (clean === "audio/wav" || clean === "audio/x-wav" || clean === "audio/wave") {
    return "wav";
  }
  if (clean === "audio/mpeg" || clean === "audio/mp3") {
    return "mp3";
  }
  return fallbackExt;
}

function pickSupportedAudioFormat(): SupportedAudioFormat | null {
  if (typeof MediaRecorder === "undefined") return null;
  if (typeof MediaRecorder.isTypeSupported !== "function") {
    return { mimeType: "", ext: "webm" };
  }
  const candidates: SupportedAudioFormat[] = [
    { mimeType: "audio/webm;codecs=opus", ext: "webm" },
    { mimeType: "audio/webm", ext: "webm" },
    { mimeType: "audio/ogg;codecs=opus", ext: "ogg" },
    { mimeType: "audio/mp4", ext: "m4a" },
  ];
  for (const item of candidates) {
    if (MediaRecorder.isTypeSupported(item.mimeType)) {
      return item;
    }
  }
  return { mimeType: "", ext: "webm" };
}

function stripMarkdownForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface UseCopilotVoiceOptions {
  isBn: boolean;
  isBusy: boolean;
  onTranscriptReady: (text: string, options: { autoSend: boolean }) => void;
  onError: (message: string) => void;
  onInfo?: (message: string) => void;
}

export function useCopilotVoice({
  isBn,
  isBusy,
  onTranscriptReady,
  onError,
  onInfo,
}: UseCopilotVoiceOptions) {
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [voiceLanguage, setVoiceLanguageState] = useState<VoiceLanguage>("auto");
  const [voiceStatus, setVoiceStatus] = useState<PromptVoiceStatus>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [ttsLoadingMsgId, setTtsLoadingMsgId] = useState<string | null>(null);

  const voiceModeRef = useRef(voiceModeEnabled);
  voiceModeRef.current = voiceModeEnabled;

  const voiceLanguageRef = useRef<VoiceLanguage>(voiceLanguage);
  voiceLanguageRef.current = voiceLanguage;

  const callbacksRef = useRef({ isBn, isBusy, onTranscriptReady, onError, onInfo });
  callbacksRef.current = { isBn, isBusy, onTranscriptReady, onError, onInfo };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceDiscardRef = useRef(false);
  const transcribeAbortRef = useRef<AbortController | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const ttsRequestSeqRef = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOICE_MODE_STORAGE_KEY);
      if (saved === "1") {
        setVoiceModeEnabled(true);
      }
      const savedLang = localStorage.getItem(VOICE_LANG_STORAGE_KEY);
      if (savedLang === "auto" || savedLang === "bn" || savedLang === "en") {
        setVoiceLanguageState(savedLang);
      }
    } catch {
      /* ignore storage access errors */
    }
  }, []);

  const setVoiceLanguage = useCallback((lang: VoiceLanguage) => {
    setVoiceLanguageState(lang);
    try {
      localStorage.setItem(VOICE_LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore storage access errors */
    }
  }, []);

  const cycleVoiceLanguage = useCallback(() => {
    setVoiceLanguageState((prev) => {
      const next: VoiceLanguage = prev === "auto" ? "bn" : prev === "bn" ? "en" : "auto";
      try {
        localStorage.setItem(VOICE_LANG_STORAGE_KEY, next);
      } catch {
        /* ignore storage access errors */
      }
      return next;
    });
  }, []);

  const cleanupMediaResources = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  const stopTtsPlayback = useCallback(() => {
    ttsRequestSeqRef.current += 1;
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = null;
      audioPlayerRef.current.onerror = null;
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = "";
      audioPlayerRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
    setTtsLoadingMsgId(null);
    setSpeakingMsgId(null);
  }, []);

  useEffect(() => {
    return () => {
      voiceDiscardRef.current = true;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      cleanupMediaResources();
      transcribeAbortRef.current?.abort();
      stopTtsPlayback();
    };
  }, [cleanupMediaResources, stopTtsPlayback]);

  const toggleVoiceMode = useCallback(() => {
    setVoiceModeEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopTtsPlayback();
      }
      try {
        localStorage.setItem(VOICE_MODE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [stopTtsPlayback]);

  const speakWithBrowserFallback = useCallback(
    (msgId: string, rawText: string, reqSeq: number): boolean => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return false;
      }
      const clean = stripMarkdownForSpeech(rawText);
      if (!clean) return false;

      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 3500));
      const hasBengali = /[\u0980-\u09FF]/.test(clean);
      utterance.lang = hasBengali ? "bn-BD" : "en-US";

      try {
        const voices = window.speechSynthesis.getVoices();
        const prefix = hasBengali ? "bn" : "en";
        const match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
        if (match) utterance.voice = match;
      } catch {
        /* ignore */
      }

      utterance.onstart = () => {
        if (ttsRequestSeqRef.current === reqSeq) {
          setSpeakingMsgId(msgId);
        }
      };
      utterance.onend = () => {
        if (ttsRequestSeqRef.current === reqSeq) {
          setSpeakingMsgId(null);
        }
      };
      utterance.onerror = () => {
        if (ttsRequestSeqRef.current === reqSeq) {
          setSpeakingMsgId(null);
        }
      };

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    []
  );

  const toggleSpeakMessage = useCallback(
    async (msgId: string, rawText: string, options?: { isAuto?: boolean }) => {
      const { isBn: bn, onError: notifyError, onInfo: notifyInfo } = callbacksRef.current;
      if (!rawText.trim()) return;

      if (!options?.isAuto && (speakingMsgId === msgId || ttsLoadingMsgId === msgId)) {
        stopTtsPlayback();
        return;
      }

      stopTtsPlayback();
      const reqSeq = ttsRequestSeqRef.current;
      const controller = new AbortController();
      ttsAbortRef.current = controller;
      setTtsLoadingMsgId(msgId);

      try {
        const audioBlob = await synthesizeVoiceSpeech({
          text: rawText,
          language: "auto",
          signal: controller.signal,
        });

        if (ttsRequestSeqRef.current !== reqSeq) return;

        const objectUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(objectUrl);
        audioUrlRef.current = objectUrl;
        audioPlayerRef.current = audio;

        audio.onended = () => {
          if (ttsRequestSeqRef.current === reqSeq) {
            stopTtsPlayback();
          }
        };
        audio.onerror = () => {
          if (ttsRequestSeqRef.current === reqSeq) {
            stopTtsPlayback();
          }
        };

        setTtsLoadingMsgId(null);
        setSpeakingMsgId(msgId);

        try {
          await audio.play();
        } catch (playErr) {
          if (ttsRequestSeqRef.current !== reqSeq) return;
          stopTtsPlayback();
          const errName = playErr instanceof Error ? playErr.name : "";
          if (errName === "NotAllowedError") {
            notifyInfo?.(
              bn
                ? "অডিও শুনতে স্পিকার আইকনে ট্যাপ করুন।"
                : "Tap the speaker icon to hear the response."
            );
          } else {
            notifyError(bn ? "অডিও প্লে করা যায়নি।" : "Could not play voice audio.");
          }
        }
      } catch (err) {
        if (ttsRequestSeqRef.current !== reqSeq) return;
        if (err instanceof ApiError && err.status === 499) return;
        if (err instanceof Error && err.name === "AbortError") return;

        setTtsLoadingMsgId(null);
        const startedFallback = speakWithBrowserFallback(msgId, rawText, reqSeq);
        if (!startedFallback && !options?.isAuto) {
          notifyError(
            bn
              ? "এই ডিভাইসে ভয়েস প্লেব্যাক পাওয়া যায়নি।"
              : "Voice playback is unavailable on this device."
          );
        }
      }
    },
    [speakingMsgId, ttsLoadingMsgId, stopTtsPlayback, speakWithBrowserFallback]
  );

  const autoSpeakReply = useCallback(
    (msgId: string, text: string) => {
      if (!voiceModeRef.current || !text.trim()) return;
      void toggleSpeakMessage(msgId, text, { isAuto: true });
    },
    [toggleSpeakMessage]
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        cleanupMediaResources();
        setVoiceStatus("idle");
        setRecordingSeconds(0);
      }
    }
  }, [cleanupMediaResources]);

  const cancelRecording = useCallback(() => {
    voiceDiscardRef.current = true;
    stopRecording();
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    const { isBn: bn, isBusy: busy, onError: notifyError } = callbacksRef.current;
    if (busy || voiceStatus !== "idle") return;

    stopTtsPlayback();

    const format = pickSupportedAudioFormat();
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !format
    ) {
      notifyError(
        bn
          ? "আপনার ব্রাউজারে মাইক্রোফোন রেকর্ডিং সমর্থিত নয় (HTTPS প্রয়োজন হতে পারে)।"
          : "Microphone recording is not supported in this browser (HTTPS may be required)."
      );
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
      } catch (constraintErr) {
        if (
          constraintErr instanceof Error &&
          (constraintErr.name === "OverconstrainedError" ||
            constraintErr.name === "ConstraintNotSatisfiedError")
        ) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw constraintErr;
        }
      }
      mediaStreamRef.current = stream;

      const recorder = format.mimeType
        ? new MediaRecorder(stream, { mimeType: format.mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      voiceDiscardRef.current = false;
      setRecordingSeconds(0);

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        const wasDiscarded = voiceDiscardRef.current;
        const chunks = audioChunksRef.current;
        const recMime = recorder.mimeType || format.mimeType || "audio/webm";
        const resolvedExt = extFromMime(recMime, format.ext);
        audioChunksRef.current = [];
        cleanupMediaResources();

        if (wasDiscarded) {
          setVoiceStatus("idle");
          setRecordingSeconds(0);
          return;
        }

        const blob = new Blob(chunks, { type: recMime });
        if (blob.size < 128) {
          setVoiceStatus("idle");
          setRecordingSeconds(0);
          callbacksRef.current.onError(
            callbacksRef.current.isBn
              ? "অডিও রেকর্ড খুব ছোট ছিল, অনুগ্রহ করে আবার বলুন।"
              : "Recording was too short. Please try speaking again."
          );
          return;
        }

        setVoiceStatus("transcribing");
        const abortCtrl = new AbortController();
        transcribeAbortRef.current = abortCtrl;

        try {
          const res = await transcribeVoiceAudio(
            blob,
            `voice.${resolvedExt}`,
            voiceLanguageRef.current,
            abortCtrl.signal
          );
          const transcript = (res.text || "").trim();
          if (!transcript) {
            callbacksRef.current.onInfo?.(
              callbacksRef.current.isBn
                ? "স্পষ্ট কথা শনাক্ত করা যায়নি। আবার চেষ্টা করুন।"
                : "No clear speech detected. Please try again."
            );
          } else {
            callbacksRef.current.onTranscriptReady(transcript, {
              autoSend: voiceModeRef.current,
            });
          }
        } catch (err) {
          if (
            (err instanceof ApiError && err.status === 499) ||
            (err instanceof Error && err.name === "AbortError")
          ) {
            return;
          }
          const msg =
            err instanceof Error && err.message
              ? err.message
              : callbacksRef.current.isBn
              ? "ভয়েস টেক্সটে রূপান্তর করা যায়নি।"
              : "Could not transcribe voice recording.";
          callbacksRef.current.onError(msg);
        } finally {
          transcribeAbortRef.current = null;
          setVoiceStatus("idle");
          setRecordingSeconds(0);
        }
      };

      recorder.start(250);
      setVoiceStatus("recording");
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      cleanupMediaResources();
      setVoiceStatus("idle");
      setRecordingSeconds(0);
      const errName = err instanceof Error ? err.name : "";
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        notifyError(
          bn
            ? "মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজার সেটিংস থেকে অনুমতি দিন।"
            : "Microphone permission denied. Please allow microphone access."
        );
      } else if (errName === "NotFoundError") {
        notifyError(
          bn ? "কোনো মাইক্রোফোন ডিভাইস পাওয়া যায়নি।" : "No microphone device found."
        );
      } else {
        notifyError(
          bn ? "মাইক্রোফোন চালু করা যায়নি।" : "Failed to access microphone."
        );
      }
    }
  }, [voiceStatus, stopTtsPlayback, cleanupMediaResources, stopRecording]);

  return {
    voiceModeEnabled,
    voiceLanguage,
    voiceStatus,
    recordingSeconds,
    speakingMsgId,
    ttsLoadingMsgId,
    toggleVoiceMode,
    setVoiceLanguage,
    cycleVoiceLanguage,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleSpeakMessage,
    stopTtsPlayback,
    autoSpeakReply,
  };
}
