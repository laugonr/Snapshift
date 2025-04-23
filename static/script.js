const convertTab = document.getElementById("convertTab");
const resizeTab = document.getElementById("resizeTab");
const convertPanel = document.getElementById("convertPanel");
const resizePanel = document.getElementById("resizePanel");
const uploadZone = document.getElementById("uploadZone");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const previewContainer = document.getElementById("previewContainer");
const imageInfo = document.getElementById("imageInfo");
const status = document.getElementById("status");
let uploadedFile = null;

// Tab switching
convertTab.addEventListener("click", () => {
  convertTab.classList.add("bg-red-500", "text-white", "shadow-md", "scale-105", "transition", "duration-300");
  resizeTab.classList.remove("bg-red-500", "text-white", "shadow-md", "scale-105", "transition", "duration-300");
  convertPanel.classList.remove("hidden");
  resizePanel.classList.add("hidden");
});

resizeTab.addEventListener("click", () => {
  resizeTab.classList.add("bg-red-500", "text-white", "shadow-md", "scale-105", "transition", "duration-300");
  convertTab.classList.remove("bg-red-500", "text-white", "shadow-md", "scale-105", "transition", "duration-300");
  convertPanel.classList.add("hidden");
  resizePanel.classList.remove("hidden");
});

// Upload & Preview
uploadZone.addEventListener("click", () => imageInput.click());

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("border-red-400", "bg-red-50");
  uploadZone.classList.add("scale-105", "transition", "duration-300");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("border-red-400", "bg-red-50");
  uploadZone.classList.remove("scale-105");
});

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("border-red-400", "bg-red-50");
  uploadZone.classList.remove("scale-105");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    imageInput.files = files;
    handleImageUpload(files[0]);
  }
});

imageInput.addEventListener("change", () => {
  if (imageInput.files.length > 0) {
    handleImageUpload(imageInput.files[0]);
  }
});

function handleImageUpload(file) {
  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove("opacity-0");
    preview.classList.add("opacity-100", "transition-opacity", "duration-700");
    previewContainer.classList.remove("hidden");
    preview.onload = () => {
      imageInfo.textContent = `Original size: ${preview.naturalWidth} × ${preview.naturalHeight}px`;
    };
  };
  reader.readAsDataURL(file);
}

// Convert submit
document.getElementById("convertForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!uploadedFile) return status.textContent = "❗ Upload an image first.";
  const format = document.getElementById("format").value;
  const formData = new FormData();
  formData.append("image", uploadedFile);
  formData.append("format", format);
  status.textContent = "⏳ Converting...";
  try {
    const res = await fetch("/convert", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Conversion failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_image.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    status.textContent = "✅ Download started!";
  } catch (err) {
    status.textContent = "❌ Error: " + err.message;
  }
});

// Resize submit
document.getElementById("resizeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!uploadedFile) return status.textContent = "❗ Upload an image first.";
  const width = parseInt(document.getElementById("resizeWidth").value || "0");
  const height = parseInt(document.getElementById("resizeHeight").value || "0");
  const lockAspect = document.getElementById("lockAspectRatio").checked;
  if (!width || !height) return status.textContent = "❗ Please enter dimensions.";
  const formData = new FormData();
  formData.append("image", uploadedFile);
  formData.append("width", width);
  formData.append("height", height);
  formData.append("lock_aspect", lockAspect);
  status.textContent = "⏳ Resizing...";
  try {
    const res = await fetch("/resize", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Resize failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resized_image.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    status.textContent = "✅ Download started!";
  } catch (err) {
    status.textContent = "❌ Error: " + err.message;
  }
});