# 📸 SnapShift

SnapShift is a clean, fast, and intuitive image tool that allows you to:
- ✅ Convert images between PNG, JPEG, and PDF
- 📐 Resize images by dimension while optionally locking the aspect ratio
- 🔁 Drag-and-drop or browse files with real-time preview

---

## 🚀 Features

- 🖼 Image preview before conversion or resizing
- 🧠 Intelligent aspect ratio locking (for resizing)
- ⚡ Fast, client-side UI with TailwindCSS
- 🔧 Built using Python Flask + Pillow (PIL)

---

## 💻 Tech Stack

| Frontend      | Backend    | Libraries         |
|---------------|------------|-------------------|
| HTML, CSS     | Flask      | Pillow (PIL)      |
| TailwindCSS   | Python 3.x | Jinja2 Templates  |

---

## 🛠 Setup & Run Locally

```bash
# Clone the repo
git clone https://github.com/your-username/snapshift.git
cd snapshift

# Create a virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Then visit: [http://localhost:5050](http://localhost:5050)

---

## 📁 Project Structure

```
snapshift/
├── app.py                 # Flask backend
├── templates/
│   └── index.html         # Frontend interface
├── static/
│   └── logo.png           # App icon / favicon
└── requirements.txt       # Dependencies
```

---

## 🧪 Example Use

1. Drag and drop an image (or click to upload)
2. Choose output format (PNG, JPEG, or PDF)
3. Click **Convert** to download the new image

---

## 🌐 Live Demo

> Coming soon to [Render](https://render.com) or GitHub Pages ✨

---

## 📸 Credits
- Icons by [Icons8](https://icons8.com)
- Favicon generated using SnapShift’s custom design

---

## 📬 Contact

Got questions or ideas?
Open an issue or reach out at `your.email@example.com`

---

> Built with 💻 by Ruben

