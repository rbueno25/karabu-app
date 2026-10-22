import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Plus,
  Link as LinkIcon,
  Trash2,
  Star,
  Eye,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  FolderOpen,
  Sparkles,
  ExternalLink,
  X
} from "lucide-react";
import api, { API_BASE, formatApiError } from "../lib/api";
import { toast } from "sonner";

/**
 * DeliverableMediaManager - Gestor moderno de multimedia estilo Google Drive
 * Permite:
 * - Subida masiva de imágenes (Examinar / Arrastrar)
 * - Agregar imágenes por URL
 * - Definir cuál es la Portada (Hero) principal
 * - Reordenar imágenes (el orden del carrusel)
 * - Vista previa a pantalla completa
 * - Eliminar fotos
 */
export default function DeliverableMediaManager({
  heroImage = "",
  galleryImages = [],
  onHeroImageChange,
  onGalleryImagesChange,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Normalizar lista de imágenes asegurando valores únicos no vacíos
  const rawList = Array.isArray(galleryImages) ? galleryImages : [];
  // Asegurarse de que heroImage esté contemplada en la galería si no está vacía
  const allImages = [...new Set([...(heroImage ? [heroImage] : []), ...rawList])].filter(Boolean);

  const currentHero = heroImage || allImages[0] || "";

  const handleSetHero = (url) => {
    onHeroImageChange(url);
    toast.success("Foto seleccionada como Portada (Hero)");
  };

  const handleDeleteImage = (indexToRemove) => {
    const targetUrl = allImages[indexToRemove];
    const updated = allImages.filter((_, idx) => idx !== indexToRemove);
    onGalleryImagesChange(updated);

    if (currentHero === targetUrl) {
      onHeroImageChange(updated[0] || "");
    }
    toast.info("Imagen eliminada");
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= allImages.length) return;
    const reordered = [...allImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onGalleryImagesChange(reordered);
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
    const validFiles = Array.from(files).filter((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      return allowed.includes(ext);
    });

    if (validFiles.length === 0) {
      toast.error("Formato no compatible. Sube imágenes JPG, PNG o WEBP.");
      return;
    }

    setUploading(true);
    const uploadedUrls = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const fullUrl = data.url.startsWith("http")
          ? data.url
          : `${API_BASE.replace(/\/api$/, "")}${data.url}`;
        uploadedUrls.push(fullUrl);
      } catch (err) {
        toast.error(`Error al subir ${file.name}: ${formatApiError(err.response?.data?.detail) || "Error"}`);
      }
    }

    setUploading(false);

    if (uploadedUrls.length > 0) {
      const combined = [...new Set([...allImages, ...uploadedUrls])];
      onGalleryImagesChange(combined);
      if (!currentHero) {
        onHeroImageChange(uploadedUrls[0]);
      }
      toast.success(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? "imagen subida" : "imágenes subidas"} con éxito`);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const urls = urlInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/"));

    if (urls.length === 0) {
      toast.error("Ingresa una URL válida (http... o https...)");
      return;
    }

    const combined = [...new Set([...allImages, ...urls])];
    onGalleryImagesChange(combined);
    if (!currentHero) {
      onHeroImageChange(urls[0]);
    }
    setUrlInput("");
    setUrlModalOpen(false);
    toast.success(`${urls.length} ${urls.length === 1 ? "imagen agregada" : "imágenes agregadas"}`);
  };

  return (
    <div className="space-y-4">
      {/* Barra superior estilo Google Drive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center font-bold">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Galería y Fotos del Entregable
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300">
                  {allImages.length} {allImages.length === 1 ? "foto" : "fotos"}
                </span>
              </h4>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Define la portada (Hero) y las fotos para el carrusel de alta calidad.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => processFiles(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0D9387] hover:bg-[#0b7d72] text-white transition-all shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            Examinar / Subir
          </button>

          <button
            type="button"
            onClick={() => setUrlModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 transition-all shadow-sm"
          >
            <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
            Añadir URL
          </button>
        </div>
      </div>

      {/* Dropzone estilo Drive si no hay imágenes o para arrastrar */}
      {allImages.length === 0 ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-[#0D9387] bg-[#0D9387]/10"
              : "border-gray-300 dark:border-zinc-700 hover:border-[#0D9387]/60 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0D9387]/10 text-[#0D9387] mx-auto mb-3 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>
          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Arrastra fotos del hotel o destino aquí
          </h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
            o haz clic para examinar archivos locales (JPG, PNG, WEBP). Se integrarán en alta resolución al carrusel.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0D9387] bg-[#0D9387]/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Compatible con múltiples archivos
            </span>
          </div>
        </div>
      ) : (
        /* Cuadrícula de archivos estilo Google Drive */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3 rounded-2xl transition-colors ${
            dragActive ? "bg-[#0D9387]/10 border-2 border-dashed border-[#0D9387]" : ""
          }`}
        >
          {allImages.map((imgUrl, idx) => {
            const isHero = currentHero === imgUrl;
            return (
              <div
                key={idx}
                className={`group relative rounded-xl border bg-white dark:bg-zinc-800/90 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${
                  isHero
                    ? "border-[#0D9387] ring-2 ring-[#0D9387]/30"
                    : "border-gray-200 dark:border-zinc-700/80 hover:border-gray-300 dark:hover:border-zinc-600"
                }`}
              >
                {/* Thumbnail con relación de aspecto cuidada */}
                <div className="relative w-full h-36 bg-slate-900 overflow-hidden flex items-center justify-center">
                  {/* Backdrop blur sutil para que no se deforme */}
                  <img
                    src={imgUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40 scale-105"
                  />
                  <img
                    src={imgUrl}
                    alt={`Foto ${idx + 1}`}
                    className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />

                  {/* Badge de Portada Hero */}
                  {isHero && (
                    <div className="absolute top-2 left-2 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D9387] text-white text-[10px] font-bold tracking-wider uppercase shadow-md">
                      <Star className="w-3 h-3 fill-current text-amber-300" />
                      Portada Hero
                    </div>
                  )}

                  {/* Número de orden */}
                  <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-semibold">
                    #{idx + 1}
                  </div>

                  {/* Overlay de hover con botón rápido para ver */}
                  <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalUrl(imgUrl)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-transform active:scale-95"
                      title="Ver en grande"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!isHero && (
                      <button
                        type="button"
                        onClick={() => handleSetHero(imgUrl)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#0D9387] hover:bg-[#0b7d72] text-white text-xs font-semibold shadow-md flex items-center gap-1 transition-transform active:scale-95"
                        title="Marcar como foto de portada"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Hacer Portada
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer de la tarjeta estilo Google Drive */}
                <div className="p-2.5 flex items-center justify-between gap-1 text-xs border-t border-gray-100 dark:border-zinc-700/60 bg-slate-50/60 dark:bg-zinc-800">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 truncate block">
                      {imgUrl.split("/").pop()?.split("?")[0] || `Imagen #${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {/* Botones de reordenamiento */}
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-20 transition"
                      title="Mover a la izquierda"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === allImages.length - 1}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-20 transition"
                      title="Mover a la derecha"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tarjeta de añadir más rápida */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[170px] border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-[#0D9387] hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-700 group-hover:bg-[#0D9387]/15 group-hover:text-[#0D9387] text-gray-400 flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Subir más fotos
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">Explorar o arrastrar</span>
          </div>
        </div>
      )}

      {/* Modal para añadir URL */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#0D9387]" />
                Agregar imagen por URL
              </h4>
              <button
                type="button"
                onClick={() => setUrlModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pega la URL de una o varias fotos (Unsplash, web del resort, etc.). Puedes separar varias URLs por salto de línea.
            </p>

            <textarea
              rows={4}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-...\nhttps://..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0D9387]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUrlModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0D9387] hover:bg-[#0b7d72] transition disabled:opacity-50"
              >
                Agregar a la galería
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de previsualización en pantalla completa */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewModalUrl}
              alt="Preview"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
