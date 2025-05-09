import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

function ImageParserApp() {
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const parseCoordinates = () => {
    if (!image) return;
    setProcessing(true);
    Tesseract.recognize(
      image,
      'eng',
      { logger: (m) => console.log(m) }
    ).then(({ data: { text } }) => {
      console.log('OCR Result:', text);
      // Flexible regex to capture various coordinate formats, even with noise
      const regex = /([0-9]{2,3}[.,]?[0-9]{4,})(?:[\s,;]+)?([0-9]{2,3}[.,]?[0-9]{4,})/g;
      const matches = Array.from(text.matchAll(regex));

      let lat = '', lon = '';
      for (const match of matches) {
        const num1 = match[1].replace(',', '.');
        const num2 = match[2].replace(',', '.');
        // Ensure the numbers make sense as coordinates
        if (parseFloat(num1) <= 90 && parseFloat(num2) <= 180) {
          lat = num1;
          lon = num2;
          break;
        }
        if (parseFloat(num2) <= 90 && parseFloat(num1) <= 180) {
          lat = num2;
          lon = num1;
          break;
        }
      }

      if (lat && lon) {
        setCoordinates({ lat, lon });
      } else {
        alert('Coordinates not found');
      }
      setProcessing(false);
    }).catch(() => {
      alert('Error processing image');
      setProcessing(false);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Image Latitude and Longitude Parser</h1>
      <input type="file" onChange={handleImageUpload} className="mb-4" />
      {image && <img src={image} alt="Uploaded" className="mb-4 rounded" />}
      <button onClick={parseCoordinates} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={processing}>
        {processing ? 'Processing...' : 'Parse Coordinates'}
      </button>
      {coordinates.lat && coordinates.lon && (
        <div className="mt-2">
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lon}</p>
        </div>
      )}
    </div>
  );
}

export default ImageParserApp;
