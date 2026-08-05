import React, { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Loader2, Check } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none transition-colors";

/**
 * ImageUpload — "Cargar imagen" button that opens a modal with two options:
 *   1. Upload from local file
 *   2. Paste a URL
 * 
 * Props:
 *   value       — current image URL (string)
 *   onChange    — (url: string) => void
 *   label       — button label (default: "Cargar imagen")
 *   previewSize — "sm" | "md" | "lg" (default: "md")
 *   className   — extra classes for the wrapper
 */
export default function ImageUpload({ value = "", onChange, label = "Cargar imagen", previewSize = "md", className = "" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("upload"); // "upload" | "url"
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const previewSizes = {
    sm: "h-24 w-40",
    md: "h-36 w-full max-w-xs",
    lg: "h-48 w-full max-w-md",
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type client-side too
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error(`Formato no permitido. Usa: ${allowed.join(", ")}`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fullUrl = data.url.startsWith("http") ? data.url : `${API_BASE.replace(/\/api$/, '')}${data.url}`;
      onChange(fullUrl);
      toast.success("Imagen cargada correctamente");
      setModalOpen(false);
    } catch (err) {
      const detail = err.response?.data?.detail || "Error al subir la imagen";
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error("Ingresa una URL válida");
      return;
    }
    onChange(trimmed);
    toast.success("URL aplicada");
    setUrlInput("");
    setModalOpen(false);
  };

  const handleRemove = () => {
    onChange("");
    toast.success("Imagen eliminada");
  };

  const handleOpen = () => {
    setUrlInput(value || "");
    setTab("upload");
    setModalOpen(true);
  };

  return (
    <div className={className}>
      {/* Preview + Button */}
      {value ? (
        <div className="space-y-2">
          {value.startsWith("data:") ? (
            <div className={`${previewSizes[previewSize]} rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700 overflow-hidden`}>
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              className={`${previewSizes[previewSize]} rounded-xl object-cover border border-gray-200 dark:border-zinc-700`}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          )}
          <div
            className={`${previewSizes[previewSize]} rounded-xl bg-gray-100 dark:bg-zinc-800 items-center justify-center border border-gray-200 dark:border-zinc-700`}
            style={{ display: "none" }}
          >
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0D9387] bg-[#0D9387]/10 hover:bg-[#0D9387]/20 rounded-lg transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-[#0D9387] hover:text-[#0D9387] rounded-xl transition-all"
        >
          <Upload className="h-4 w-4" />
          {label}
        </button>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Cargar imagen</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "upload"
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Upload className="h-4 w-4" />
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => setTab("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "url"
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                Pegar URL
              </button>
            </div>

            {/* Tab content */}
            {tab === "upload" ? (
              <div className="space-y-4">
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    uploading
                      ? "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50"
                      : "border-gray-300 dark:border-zinc-600 hover:border-[#0D9387] hover:bg-[#0D9387]/5"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-[#0D9387] animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Subiendo imagen...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Haz clic para seleccionar
                      </span>
                      <span className="text-xs text-gray-400">
                        JPG, PNG, GIF, WebP, SVG — máx. 10 MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    URL de la imagen
                  </label>
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className={inputCls}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUrlSubmit();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Aplicar URL
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
