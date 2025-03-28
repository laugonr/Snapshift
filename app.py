from flask import Flask, request, send_file, render_template, jsonify
from PIL import Image
from io import BytesIO
from reportlab.pdfgen import canvas

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_image():
    image_file = request.files.get('image')
    output_format = request.form.get('format', 'PNG').upper()

    if not image_file:
        return jsonify({"error": "No image uploaded"}), 400

    img = Image.open(image_file.stream).convert("RGB")
    buffer = BytesIO()

    if output_format == 'PDF':
        pdf = canvas.Canvas(buffer)
        img_width, img_height = img.size
        buffer_img = BytesIO()
        img.save(buffer_img, format='PNG')
        buffer_img.seek(0)
        pdf.drawInlineImage(buffer_img, 0, 0, width=img_width, height=img_height)
        pdf.showPage()
        pdf.save()
        buffer.seek(0)
        return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name='converted.pdf')

    img.save(buffer, format=output_format)
    buffer.seek(0)
    return send_file(buffer, mimetype=f'image/{output_format.lower()}', as_attachment=True, download_name=f'converted.{output_format.lower()}')

@app.route('/resize', methods=['POST'])
def resize_image():
    image_file = request.files.get('image')
    width = int(request.form.get('width', 0))
    height = int(request.form.get('height', 0))
    lock_aspect = request.form.get('lock_aspect', 'false') == 'true'

    if not image_file or width <= 0 or height <= 0:
        return jsonify({"error": "Missing image or invalid dimensions"}), 400

    img = Image.open(image_file.stream)

    if lock_aspect:
        aspect_ratio = img.width / img.height
        if width / height > aspect_ratio:
            width = int(height * aspect_ratio)
        else:
            height = int(width / aspect_ratio)

    resized = img.resize((width, height))
    buffer = BytesIO()
    resized.save(buffer, format='PNG')
    buffer.seek(0)
    return send_file(buffer, mimetype='image/png', as_attachment=True, download_name='resized_image.png')

if __name__ == '__main__':
    app.run(debug=True)
