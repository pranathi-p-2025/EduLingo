import React, { useState } from 'react';
import axios from 'axios';
import { ReactMic } from 'react-mic';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);               // State for file upload
  const [text, setText] = useState('');                  // State for text input
  const [translated, setTranslated] = useState('');      // State for translated text
  const [language, setLanguage] = useState('en');        // State for language selection
  const [emotion, setEmotion] = useState('neutral');     // State for emotion selection
  const [recording, setRecording] = useState(false);     // State to control recording status
  const [audioUrl, setAudioUrl] = useState(null);        // State for storing audio URL
  const [audioFilePath, setAudioFilePath] = useState(null); // State for storing the audio file path

  // Handle file upload change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle text translation
  const handleTranslate = async () => {
    const formData = new FormData();
    formData.append('text', text);
    if (file) formData.append('file', file);
    formData.append('lang', language);

    try {
      const res = await axios.post('http://localhost:5000/translate', formData);
      setTranslated(res.data.translated); // Set translated text
    } catch (error) {
      console.error('Error during translation:', error);
    }
  };

  // Handle audio playback
  const handlePlayAudio = async () => {
    try {
      const res = await axios.post('http://localhost:5000/audio', {
        text: translated,
        emotion: emotion,
        lang: language
      }, { responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'audio/mp3' });
      const audioURL = URL.createObjectURL(blob);
      const audio = new Audio(audioURL);
      audio.play();
    } catch (error) {
      console.error('Error during audio playback:', error);
    }
  };

  // Start recording audio
  const startRecording = () => {
    setRecording(true);
  };

  // Stop recording audio
  const stopRecording = () => {
    setRecording(false);
  };

  // Handle the stop event of audio recording
  const handleAudioStop = async (data) => {
    const audioBlob = data.blob;
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl); // Save the audio URL to display or play back

    // Send the audio file to the backend for transcription and translation
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('lang', language);

    try {
      const res = await axios.post('http://localhost:5000/audio-input', formData);
      setText(res.data.original); // Set original speech text
      setTranslated(res.data.translated); // Set translated text
      setAudioFilePath(res.data.audio_file); // Set the audio file path returned by the backend
    } catch (error) {
      console.error('Error during audio processing:', error);
    }
  };

  return (
    <div className="pastel-background"> {/* Apply pastel gradient background to entire content */}
      <div className="content-box">
        <h1 className="text-2xl font-bold text-center">EduLingo</h1>

        {/* File Input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          accept="audio/*,.docx,.pdf,.txt"  // Accept any audio file type along with document types
        />

        {/* Textarea for text input */}
        <textarea
          className="w-full h-24 p-2 border rounded"
          placeholder="Type your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {/* Language and Emotion Select */}
        <div className="flex gap-4">
          <select className="w-full p-2 border rounded" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value=" af ">Afrikaans</option>
            <option value="sq">Albanian</option>
            <option value="am">Amharic</option>
            <option value="ar"> Arabic</option>
            <option value="az">Azerbaijani</option>
            <option value="eu">Basque</option>
            <option value="be">Belarusian</option>
            <option value="bn">Bengali</option>
            <option value="bs">Bosnian</option>
            <option value="bg">Bulgarian</option>
            <option value="zh">Chinese</option>
            <option value="hr">Croatian</option>
            <option value="cs">Czech</option>
            <option value="da">Danish </option>
            <option value="nl">Dutch</option>
            <option value="en">English</option>
            <option value="eo">Esperanto</option>
            <option value="fi">Finnish</option>
            <option value="fr">French</option>
            <option value="ka">Georgian</option>
            <option value="de">German</option>
            <option value="el">Greek</option>
            <option value="gu">Gujarati</option>
            <option value="ht">Haitian Creole</option>
            <option value="he">Hebrew</option>
            <option value="hi">Hindi</option>
            <option value="hu">Hungarian</option>
            <option value="is">Icelandic</option>
            <option value="ig">Igbo</option>
            <option value="id">Indonesian</option>
            <option value="ga">Irish</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="jv">Javanese</option>
            <option value="kn">Kannada</option>
            <option value="kk">Kazakh</option>
            <option value="km">Khmer</option>
            <option value="ko">Korean</option>
            <option value="ku">Kurdish</option>
            <option value="ky">Kyrgyz</option>
            <option value="hi">Hindi</option>
            <option value="la">Lao</option>
            <option value="lt">Latvian</option>
            <option value="lt">Lithuanian</option>
            <option value="mk">Macedonian</option>
            <option value="mg">Malagasy</option>
            <option value="ms">Malayalam</option>
            <option value="mt">Maltese</option>   
            <option value="mr">Marathi</option>
            <option value="mn">Mongolian</option>
            <option value="ne">Nepali</option>
            <option value="no">Norwegian</option>
            <option value="ps">Pashto</option>
            <option value="fa">Persian</option>
            <option value="pl">Polish</option>
            <option value="pt">Portuguese</option>
            <option value="pa">Punjabi</option>
            <option value="ro">Romanian</option>
            <option value="ru">Russian</option>
            <option value="sr">Serbian</option>
            <option value="si">Sinhala</option>
            <option value="sk">Slovak</option>
            <option value="sl">Slovenian</option>
            <option value="so">Somali</option>
            <option value="es">Spanish</option>
            <option value="sw">Swahili</option>
            <option value="sv">Swedish</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="th">Thai</option>
            <option value="tr">Turkish</option>
            <option value="uk">Ukrainian</option>
            <option value="ur">Urdu</option>
            <option value="uz">Uzbek</option>
            <option value="vi">Vietnamese</option>
            <option value="cy">Welsh</option>
            <option value="xh">Xhosa</option>
            <option value="yo">Yoruba</option>
            <option value="zu">Zulu</option>
          </select>

          <select className="w-full p-2 border rounded" value={emotion} onChange={(e) => setEmotion(e.target.value)}>
            <option value="neutral">Neutral</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="angry">Angry</option>
            <option value="excited">Excited</option>
            <option value="nervous">Nervous</option>
            <option value="proud">Proud</option>
            <option value="excited">Excited</option>
            <option value="sympathetic">Sympathetic</option>
            <option value="surprised">Surprised</option>
            <option value="disgusted">Disgusted</option>
          </select>
        </div>

        {/* Translate Button */}
        <button
          className="bg-blue-500 text-white p-2 rounded w-full"
          onClick={handleTranslate}
        >
          Translate
        </button>

        {/* Display Translated Text */}
        <div className="p-4 bg-gray-100 rounded">
          <strong>Translated Output:</strong>
          <p>{translated}</p>
        </div>

        {/* Play Audio Button */}
        <button
          className="bg-green-500 text-white p-2 rounded w-full"
          onClick={handlePlayAudio}
        >
          🔊 Play Audio
        </button>

        {/* Recording Controls */}
        <div>
          <ReactMic
            record={recording}
            className="sound-wave"
            onStop={handleAudioStop}
            strokeColor="black"
            backgroundColor="white"
          />
          <button onClick={startRecording} className="bg-blue-500 text-white p-2 rounded">Start Recording</button>
          <button onClick={stopRecording} className="bg-red-500 text-white p-2 rounded">Stop Recording</button>
        </div>

        {/* Display Recorded Audio */}
        {audioUrl && (
          <div>
            <p>Recorded Audio:</p>
            <audio controls>
              <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio tag.
            </audio>
            <a href={audioFilePath} download="user_audio.wav">
              <button className="bg-blue-500 text-white p-2 rounded">
                Download Audio
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
