"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { studentsService } from "@/services/students.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";

function validateImageFile(file) {
  if (!file) return "Selecciona un archivo.";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Solo se permiten imágenes JPEG, PNG o WebP.";
  }
  if (file.size > MAX_BYTES) {
    return "El archivo no puede superar 2 MB.";
  }
  return null;
}

function revokePreview(url) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function UploadPictureModal({ open, student, onClose, onSaved }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  const resetState = useCallback(() => {
    setError("");
    setLoading(false);
    setPreviewUrl((u) => {
      revokePreview(u);
      return "";
    });
    setSelectedFile(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [stopCamera]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    const msg = validateImageFile(file);
    if (msg) {
      setError(msg);
      setSelectedFile(null);
      setPreviewUrl((prev) => {
        revokePreview(prev);
        return "";
      });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      revokePreview(prev);
      return URL.createObjectURL(file);
    });
  };

  const startCamera = async () => {
    setError("");
    setPreviewUrl((prev) => {
      revokePreview(prev);
      return "";
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setError("No se pudo acceder a la cámara.");
      stopCamera();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setError("La cámara no está lista.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("No se pudo capturar la imagen.");
      return;
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("No se pudo generar la imagen.");
          return;
        }
        const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
        const msg = validateImageFile(file);
        if (msg) {
          setError(msg);
          return;
        }
        stopCamera();
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      },
      "image/jpeg",
      0.92
    );
  };

  const handleSubmit = async () => {
    if (!student?.id) return;
    const msg = validateImageFile(selectedFile);
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updated = await studentsService.uploadProfilePicture(student.id, selectedFile);
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      const d = err.response?.data;
      let m = "Error al subir la imagen.";
      if (typeof d === "string") m = d;
      else if (d?.detail) m = d.detail;
      else if (d && typeof d === "object") {
        const first = Object.values(d)[0];
        if (Array.isArray(first)) m = first[0];
        else if (typeof first === "string") m = first;
      }
      setError(m);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClose = () => {
    if (loading) return;
    resetState();
    onClose?.();
  };

  if (!open || !student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={handleBackdropClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">
          Foto de perfil — {student.first_name} {student.last_name}
        </h2>
        <p className="mt-1 text-sm text-gray-500">JPEG, PNG o WebP. Máximo 2 MB.</p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-file">Archivo local</Label>
            <input
              id="profile-file"
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="block w-full text-sm"
              disabled={loading || cameraOn}
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {!cameraOn ? (
              <Button type="button" variant="outline" disabled={loading} onClick={startCamera}>
                Usar cámara
              </Button>
            ) : (
              <>
                <Button type="button" variant="secondary" disabled={loading} onClick={capturePhoto}>
                  Capturar foto
                </Button>
                <Button type="button" variant="outline" disabled={loading} onClick={stopCamera}>
                  Detener cámara
                </Button>
              </>
            )}
          </div>

          {cameraOn && (
            <div className="overflow-hidden rounded-md border bg-black">
              <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted autoPlay />
            </div>
          )}

          {previewUrl && !cameraOn && (
            <div className="overflow-hidden rounded-md border">
              <img src={previewUrl} alt="Vista previa" className="max-h-64 w-full object-contain" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" disabled={loading} onClick={handleBackdropClose}>
              Cerrar
            </Button>
            <Button type="button" disabled={loading || !selectedFile || cameraOn} onClick={handleSubmit}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
