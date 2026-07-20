// Unsigned upload straight from the browser to Cloudinary — no API secret
// needed client-side, only a cloud name (not secret) and an "unsigned"
// upload preset configured in the Cloudinary dashboard. Returns the
// resulting secure_url, which callers persist wherever they need it
// (Result3D stores it in useFormStore, which flows into the projects
// table's payload jsonb via snapshotForSave — see src/lib/projects.js).
export async function uploadPlanImage(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) return { error: "not_configured" };

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error?.message ?? "upload_failed" };

  return { url: data.secure_url };
}
