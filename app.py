from flask import Flask, request, send_file, render_template
from PIL import Image
from io import BytesIO

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert_image():
    image_file = request.files.get('image')
    output_format = request.form.get('format', 'PNG').upper()

    if not image_file:
        return "No image uploaded", 400

    try:
        img = Image.open(image_file.stream)
        buffer = BytesIO()

        if output_format == 'PDF':
            if img.mode in ['RGBA', 'P', 'LA']:
                img = img.convert('RGB')
            img.save(buffer, format='PDF')
            buffer.seek(0)
            return send_file(
                buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='converted_image.pdf'
            )

        img.save(buffer, format=output_format)
        buffer.seek(0)
        mimetype = f'image/{output_format.lower()}'
        return send_file(buffer, mimetype=mimetype, as_attachment=True, download_name=f'converted_image.{output_format.lower()}')

    except Exception as e:
        print("[ERROR] PDF Conversion failed:", str(e))
        return f"Error during conversion: {str(e)}", 500

@app.route('/resize', methods=['POST'])
def resize_image():
    image_file = request.files.get('image')
    width = int(request.form.get('width', 0))
    height = int(request.form.get('height', 0))
    lock_aspect = request.form.get('lock_aspect', 'false') == 'true'

    if not image_file or width <= 0 or height <= 0:
        return "Missing image or invalid dimensions", 400

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
    app.run(debug=True, port=5050)
