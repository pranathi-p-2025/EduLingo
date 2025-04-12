import os
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from deep_translator import GoogleTranslator
import pyttsx3
import speech_recognition as sr
from gtts import gTTS
from docx import Document
from PyPDF2 import PdfReader

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Path to save the uploaded audio files
UPLOAD_FOLDER = 'uploaded_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Max file upload size (50 MB)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

# Helper function to extract text from various file types
def extract_text_from_file(file):
    if file.filename.endswith('.txt'):
        return file.read().decode('utf-8')
    elif file.filename.endswith('.pdf'):
        reader = PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
        return text
    elif file.filename.endswith('.docx'):
        doc = Document(file)
        text = ''
        for para in doc.paragraphs:
            text += para.text
        return text
    else:
        raise ValueError('Unsupported file type')

@app.route('/translate', methods=['POST'])
def translate():
    text = request.form.get('text')
    file = request.files.get('file')
    lang = request.form.get('lang', 'en')

    if file:
        try:
            content = extract_text_from_file(file)
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 400
        text = content  # Override with extracted text

    # Translate the text
    try:
        translated = GoogleTranslator(target=lang).translate(text)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'translated': translated})

@app.route('/audio', methods=['POST'])
def audio():
    data = request.get_json()
    text = data.get('text', '')
    emotion = data.get('emotion', 'neutral')
    lang = data.get('lang', 'en')  # Language parameter

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Emotion-based adjustments (optional)
    tts = gTTS(text=text, lang=lang, slow=False)
    
    # Adjust the speech tone or speed based on emotion
    if emotion == 'happy':
        tts = gTTS(text=text, lang=lang, slow=False, tld='com')  # Simulate happy tone
    elif emotion == 'sad':
        tts = gTTS(text=text, lang=lang, slow=True)  # Simulate slow sad tone
    elif emotion == 'angry':
        tts = gTTS(text=text, lang=lang, slow=False)  # Faster pace to simulate anger
    elif emotion == 'nervous':
        tts = gTTS(text=text, lang=lang, slow=True)  # Simulate a hesitant, slower nervous tone
    elif emotion == 'proud':
        tts = gTTS(text=text, lang=lang, slow=False)  # Confident tone, normal speed
    elif emotion == 'excited':
        tts = gTTS(text=text, lang=lang, slow=False)  # Faster pace to simulate excitement
    elif emotion == 'sympathetic':
        tts = gTTS(text=text, lang=lang, slow=True)  # Slower tone to convey sympathy
    elif emotion == 'surprised':
        tts = gTTS(text=text, lang=lang, slow=False)  # Faster pace to simulate surprise
    elif emotion == 'disgusted':
        tts = gTTS(text=text, lang=lang, slow=False)  # A bit of a sharp, fast pace to simulate disgust

    # Save to a temporary file
    temp_path = tempfile.mktemp(suffix='.mp3')
    tts.save(temp_path)

    # Check if file was created and has size
    if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
        return jsonify({'error': 'Failed to generate audio'}), 500

    return send_file(temp_path, mimetype='audio/mp3', as_attachment=False)

@app.route('/audio-input', methods=['POST'])
def audio_input():
    # Expect the audio to be in WAV format.
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No audio file provided'}), 400
    
    # Save the uploaded file to a permanent location
    audio_path = os.path.join(UPLOAD_FOLDER, 'user_audio.wav')
    file.save(audio_path)

    # Initialize recognizer
    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(audio_path) as source:
            audio = recognizer.record(source)  # Read the entire file
            text = recognizer.recognize_google(audio)  # Recognize speech using Google Web Speech API

        # Translate the text to the chosen language
        translated = GoogleTranslator(target=request.form.get('lang', 'en')).translate(text)

        # Return the translated text and audio file path
        return jsonify({'translated': translated, 'original': text, 'audio_file': f"/download/{os.path.basename(audio_path)}"})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)