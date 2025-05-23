// Get elements
const convertTab = document.getElementById("convertTab");
const resizeTab = document.getElementById("resizeTab");
const convertPanel = document.getElementById("convertPanel");
const resizePanel = document.getElementById("resizePanel");
const uploadZone = document.getElementById("uploadZone");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const previewContainer = document.getElementById("previewContainer");
const imageInfo = document.getElementById("imageInfo");
let uploadedFile = null;

// Helper functions
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

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

// Upload and Preview
uploadZone.addEventListener("click", () => imageInput.click());

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("border-red-400", "bg-red-50", "scale-105", "transition", "duration-300");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("border-red-400", "bg-red-50", "scale-105");
});

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("border-red-400", "bg-red-50", "scale-105");
  const files = Array.from(e.dataTransfer.files);
  if (!files || files.length === 0) return;
  imageInput.files = e.dataTransfer.files;

  document.getElementById("loadingMessage").classList.remove("hidden");
  document.getElementById("successMessage").classList.add("hidden");
  document.getElementById("errorMessage").classList.add("hidden");

  setTimeout(() => {
    document.getElementById("loadingMessage").classList.add("hidden");
    handleImageUpload(files[0]);
  }, 8000);
});

imageInput.addEventListener("change", () => {
  const files = imageInput.files;
  if (!files || files.length === 0) return;

  document.getElementById("loadingMessage").classList.remove("hidden");
  document.getElementById("successMessage").classList.add("hidden");
  document.getElementById("errorMessage").classList.add("hidden");

  setTimeout(() => {
    document.getElementById("loadingMessage").classList.add("hidden");
    handleImageUpload(files[0]);
  }, 8000);
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
      const fileSizeKB = (file.size / 1024).toFixed(1);
      imageInfo.textContent = `${file.name} (${fileSizeKB} KB) - ${preview.naturalWidth} × ${preview.naturalHeight}px`;
    };
    if (cropper) cropper.destroy();

    cropper = new Cropper(preview, {
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false
    });
  };
  reader.readAsDataURL(file);
}

// Convert submit
document.getElementById('convertForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  document.getElementById("loadingMessage").classList.remove("hidden");
  document.getElementById("successMessage").classList.add("hidden");
  document.getElementById("errorMessage").classList.add("hidden");

  const formData = new FormData();
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    await new Promise(resolve => {
      croppedCanvas.toBlob(blob => {
        formData.append('image', blob, 'cropped.png');
        resolve();
      });
    });
  } else {
    formData.append('image', uploadedFile);
  }
  formData.append('format', document.getElementById('format').value); // attach selected format

  try {
    const res = await fetch("/convert", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Conversion failed");
    const blob = await res.blob();
    const selectedFormat = document.getElementById('format').value.toLowerCase();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_image.${selectedFormat}`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);
    document.getElementById("loadingMessage").classList.add("hidden");
    document.getElementById("successMessage").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("successMessage").classList.add("hidden");
    }, 5000);
  } catch (err) {
    document.getElementById("loadingMessage").classList.add("hidden");
    document.getElementById("errorMessage").classList.remove("hidden");
  }
});

// Resize submit
document.getElementById("resizeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!uploadedFile) return;

  const width = parseInt(document.getElementById("resizeWidth").value || "0");
  const height = parseInt(document.getElementById("resizeHeight").value || "0");
  const lockAspect = document.getElementById("lockAspectRatio").checked;

  if (!width || !height) return;

  const formData = new FormData();
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    await new Promise(resolve => {
      croppedCanvas.toBlob(blob => {
        formData.append("image", blob, "cropped.png");
        resolve();
      });
    });
  } else {
    formData.append("image", uploadedFile);
  }
  formData.append("width", width);
  formData.append("height", height);
  formData.append("lock_aspect", lockAspect);

  document.getElementById("loadingMessage").classList.remove("hidden");
  document.getElementById("successMessage").classList.add("hidden");
  document.getElementById("errorMessage").classList.add("hidden");

  try {
    const res = await fetch("/resize", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Resize failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resized_image.png";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);
    document.getElementById("loadingMessage").classList.add("hidden");
    document.getElementById("successMessage").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("successMessage").classList.add("hidden");
    }, 5000);
  } catch (err) {
    document.getElementById("loadingMessage").classList.add("hidden");
    document.getElementById("errorMessage").classList.remove("hidden");
  }
});

// Dark Mode Toggle with persistence and label update
const toggleDarkMode = document.getElementById('toggleDarkMode');
const rootElement = document.documentElement;
const modeText = document.getElementById('darkModeText');

// Load saved mode
if (localStorage.getItem('theme') === 'dark') {
  rootElement.classList.add('dark');
  if (modeText) modeText.textContent = 'Light Mode';
} else {
  if (modeText) modeText.textContent = 'Dark Mode';
}

function updateMode() {
  const isDark = rootElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (modeText) modeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

toggleDarkMode.addEventListener('click', updateMode);
// --- Cropper.js Real-Time Cropping and Preview ---
let cropper;