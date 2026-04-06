"use client";
import React, { useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { IMAGE_STRATEGIES, GENERAL_IMAGE_SLOTS, VARIANT_IMAGE_SLOTS, getColorTw } from "@/lib/product-wizard-constants";
import { useToast } from "@/contexts/ToastContext";

function MediaSlot({ slotKey, label, required, preview, mimeType, accept, onUpload, onRemove }) {
  const ref = useRef(null);
  const isVideo = mimeType?.startsWith("video/");

  const handle = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(slotKey, file, URL.createObjectURL(file));
    e.target.value = "";
  };

  return (
    <div className="flex flex-col">
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handle} />
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-[#2E5C45]/30 aspect-square bg-gray-50">
          {isVideo ? (
            <video src={preview} className="w-full h-full object-cover" muted playsInline />
          ) : (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button type="button" onClick={() => onRemove(slotKey)} className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#2E5C45] text-white text-[9px] font-bold">{isVideo ? "VIDEO" : "DONE"}</div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="rounded-xl border-2 border-dashed border-[#dbe7e0] aspect-square flex flex-col items-center justify-center gap-1.5 hover:border-[#2E5C45]/40 hover:bg-[#2E5C45]/5 transition-all cursor-pointer">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
          <span className="text-[10px] text-gray-500 font-medium">Upload</span>
        </button>
      )}
      <p className="text-[11px] font-semibold text-gray-600 mt-1.5 text-center truncate">{label}{required && <span className="text-red-400"> *</span>}</p>
    </div>
  );
}

export default function MediaStep() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const { error: showError, info: showInfo } = useToast();
  const [error, setError] = useState(null);
  const [openColors, setOpenColors] = useState({});

  const uniqueColors = [...new Set(state.variants.map((v) => v.color).filter(Boolean))];

  const persistedMimeType = (key) => state.persistedImages?.[key]?.mimeType || state.persistedImages?.[key]?.mime_type || "";

  const uploadMedia = (key, file, preview) => {
    if (file.size > 15 * 1024 * 1024) {
      const message = file.type.startsWith("video/") ? "Video files must be 15 MB or smaller." : "Media files must be 15 MB or smaller.";
      setError(message);
      showError(message);
      return;
    }

    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
    if (!isImage && !isVideo) {
      const message = "Upload JPG, PNG, WebP, MP4, WebM, or MOV files only.";
      setError(message);
      showError(message);
      return;
    }

    dispatch({ type: "SET_IMAGE", key, file, preview });
    setError(null);
  };

  const removeMedia = (key) => dispatch({ type: "REMOVE_IMAGE", key });

  const validate = () => {
    const hasMedia = (key) => state.images[key] || state.persistedImages[key];
    const strategy = state.imageStrategy;
    if (strategy === "general") {
      if (!hasMedia("general_front") || !hasMedia("general_back")) return "Upload Front and Back views.";
    } else if (strategy === "variant") {
      for (const color of uniqueColors) {
        const safe = color.replace(/\s/g, "_");
        if (!hasMedia(`variant_${safe}_front`) || !hasMedia(`variant_${safe}_back`)) return `Upload Front and Back views for ${color}.`;
      }
    } else if (strategy === "mixed") {
      if (!hasMedia("mixed_general_front") || !hasMedia("mixed_general_back")) return "Upload Front and Back views for the general product media.";
    }
    return null;
  };

  const handleNext = () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      showError(validationError);
      return;
    }
    goNext();
  };

  return (
    <WizardShell
      title="Product Media"
      subtitle="Upload the media buyers will use to understand the product before they add it to cart."
    >
      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-5">{error}</div>}

      <div className="rounded-2xl border border-[#dbe7e0] bg-[#f7fbf8] p-4 mb-6">
        <p className="text-sm font-bold text-gray-900">Required and recommended media</p>
        <p className="mt-1 text-sm text-gray-600">Required: Front and Back views. Recommended: side view, detail shot, texture close-up, and one short product video.</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-2.5">Media Strategy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {IMAGE_STRATEGIES.map((strategy) => {
            const selected = state.imageStrategy === strategy.value;
            return (
              <button
                key={strategy.value}
                type="button"
                onClick={() => {
                  dispatch({ type: "SET_IMAGE_STRATEGY", payload: strategy.value });
                  showInfo("Media strategy updated.");
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${selected ? "border-[#2E5C45] bg-[#2E5C45]/5" : "border-[#dbe7e0] hover:border-[#2E5C45]/30"}`}
              >
                <p className={`text-sm font-bold ${selected ? "text-[#2E5C45]" : "text-gray-900"}`}>{strategy.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{strategy.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {state.imageStrategy === "general" && (
        <div className="mb-5">
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
            These media assets apply to all {state.variants.length} variants. Upload Front and Back views to continue.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENERAL_IMAGE_SLOTS.map((slot) => (
              <MediaSlot
                key={slot.key}
                slotKey={`general_${slot.key}`}
                label={slot.label}
                required={slot.required}
                preview={state.imagePreviews[`general_${slot.key}`]}
                mimeType={state.images[`general_${slot.key}`]?.type || persistedMimeType(`general_${slot.key}`)}
                accept="image/jpeg,image/png,image/webp"
                onUpload={uploadMedia}
                onRemove={removeMedia}
              />
            ))}
            <MediaSlot
              slotKey="general_video"
              label="Product Video"
              required={false}
              preview={state.imagePreviews.general_video}
              mimeType={state.images.general_video?.type || persistedMimeType("general_video")}
              accept="video/mp4,video/webm,video/quicktime"
              onUpload={uploadMedia}
              onRemove={removeMedia}
            />
          </div>
        </div>
      )}

      {state.imageStrategy === "variant" && (
        <div className="space-y-3 mb-5">
          {uniqueColors.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">No color variants found. Go back and add variants first.</p>
          ) : uniqueColors.map((color) => {
            const safe = color.replace(/\s/g, "_");
            const open = openColors[color] !== false;
            const variantSizes = state.variants.filter((v) => v.color === color).map((v) => v.size);
            return (
              <div key={color} className="border border-[#dbe7e0] rounded-xl overflow-hidden">
                <button type="button" onClick={() => setOpenColors((prev) => ({ ...prev, [color]: !open }))} className="w-full flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className={`w-4 h-4 rounded-full ${getColorTw(color)} shrink-0`} />
                  <span className="text-sm font-bold text-gray-900 flex-1">{color}</span>
                  <span className="text-xs text-gray-500">{variantSizes.join(", ")}</span>
                  <span className="text-gray-400">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {VARIANT_IMAGE_SLOTS.map((slot) => (
                        <MediaSlot
                          key={slot.key}
                          slotKey={`variant_${safe}_${slot.key}`}
                          label={slot.label}
                          required={slot.required}
                          preview={state.imagePreviews[`variant_${safe}_${slot.key}`]}
                          mimeType={state.images[`variant_${safe}_${slot.key}`]?.type || persistedMimeType(`variant_${safe}_${slot.key}`)}
                          accept="image/jpeg,image/png,image/webp"
                          onUpload={uploadMedia}
                          onRemove={removeMedia}
                        />
                      ))}
                    </div>
                    <textarea rows={2} value={state.variantNotes[color] || ""} onChange={(e) => dispatch({ type: "SET_VARIANT_NOTE", color, note: e.target.value })} placeholder={`Notes about the ${color} variant that can help buyers or merchandising teams...`} className="w-full mt-3 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {state.imageStrategy === "mixed" && (
        <div className="space-y-5 mb-5">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2.5">Shared Product Media</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GENERAL_IMAGE_SLOTS.slice(0, 4).map((slot) => (
                <MediaSlot
                  key={slot.key}
                  slotKey={`mixed_general_${slot.key}`}
                  label={slot.label}
                  required={slot.required}
                  preview={state.imagePreviews[`mixed_general_${slot.key}`]}
                  mimeType={state.images[`mixed_general_${slot.key}`]?.type || persistedMimeType(`mixed_general_${slot.key}`)}
                  accept="image/jpeg,image/png,image/webp"
                  onUpload={uploadMedia}
                  onRemove={removeMedia}
                />
              ))}
              <MediaSlot
                slotKey="mixed_general_video"
                label="Product Video"
                required={false}
                preview={state.imagePreviews.mixed_general_video}
                mimeType={state.images.mixed_general_video?.type || persistedMimeType("mixed_general_video")}
                accept="video/mp4,video/webm,video/quicktime"
                onUpload={uploadMedia}
                onRemove={removeMedia}
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Color-Specific Media (optional)</h4>
            {uniqueColors.map((color) => {
              const safe = color.replace(/\s/g, "_");
              return (
                <div key={color} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl mb-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${getColorTw(color)} shrink-0 mt-1`} />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {VARIANT_IMAGE_SLOTS.slice(0, 2).map((slot) => (
                      <MediaSlot
                        key={slot.key}
                        slotKey={`mixed_variant_${safe}_${slot.key}`}
                        label={`${color} ${slot.label}`}
                        required={false}
                        preview={state.imagePreviews[`mixed_variant_${safe}_${slot.key}`]}
                        mimeType={state.images[`mixed_variant_${safe}_${slot.key}`]?.type || persistedMimeType(`mixed_variant_${safe}_${slot.key}`)}
                        accept="image/jpeg,image/png,image/webp"
                        onUpload={uploadMedia}
                        onRemove={removeMedia}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <label className="block text-sm font-bold text-gray-900 mb-1.5">Media Notes</label>
        <textarea
          rows={3}
          value={state.productNotes}
          onChange={(e) => dispatch({ type: "SET_PRODUCT_NOTES", payload: e.target.value })}
          placeholder="Add merchandising notes, fit notes, or media reminders for the team..."
          className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm resize-none"
        />
      </div>

      <WizardNav onBack={goBack} onNext={handleNext} nextLabel="Continue to Specifications" />
    </WizardShell>
  );
}
