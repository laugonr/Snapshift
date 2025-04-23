"""
SnapShift - Flask application for image conversion and resizing.
"""

from flask import Flask, request, send_file, render_template
from PIL import Image
from io import BytesIO
import os
import logging

logging.basicConfig(level=logging.INFO)

def create_app():
    app = Flask(__name__)

    @app.route('/')
    def home():
        return render_template('index.html')

    @app.route('/convert', methods=['POST'])
    def convert_image():
        return handle_convert()

    @app.route('/resize', methods=['POST'])
    def resize_image():
        return handle_resize()

    return app

app = create_app()

def handle_convert():
    image_file = request.files.get('image')
    output_format = request.form.get('format', 'PNG').upper()

    if not image_file:
        return "No image uploaded", 400

    if not image_file.mimetype.startswith("image/"):
        return "Invalid file type", 400

    try:
        img = Image.open(image_file.stream)
        buffer = BytesIO()

        if output_format == 'PDF':
            if img.mode in ['RGBA', 'P', 'LA']:
                img = img.convert('RGB')
            img.save(buffer, format='PDF')
            mimetype = 'application/pdf'
            filename = 'converted_image.pdf'
        else:
            img.save(buffer, format=output_format)
            mimetype = f'image/{output_format.lower()}'
            filename = f'converted_image.{output_format.lower()}'

        buffer.seek(0)
        return send_file(buffer, mimetype=mimetype, as_attachment=True, download_name=filename)

    except Exception as e:
        app.logger.error("Image conversion failed: %s", str(e))
        return f"Error during conversion: {str(e)}", 500

def handle_resize():
    image_file = request.files.get('image')
    width = int(request.form.get('width', 0))
    height = int(request.form.get('height', 0))
    lock_aspect = request.form.get('lock_aspect', 'false') == 'true'

    if not image_file or width <= 0 or height <= 0:
        return "Missing image or invalid dimensions", 400

    if not image_file.mimetype.startswith("image/"):
        return "Invalid file type", 400

    if width > 10000 or height > 10000:
        return "Dimensions too large", 400

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
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
