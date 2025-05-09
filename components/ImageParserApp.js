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

      // Enhanced regex to capture more number formats, including coordinates
      const regex = /(-?\d{1,3}(?:[.,]\d+)?)[\s,;]+(-?\d{1,3}(?:[.,]\d+)?)/g;
      const matches = Array.from(text.matchAll(regex));

      let lat = '', lon = '';
      for (const match of matches) {
        const num1 = parseFloat(match[1].replace(',', '.'));
        const num2 = parseFloat(match[2].replace(',', '.'));

        // Check plausible latitude and longitude ranges
        if ((Math.abs(num1) <= 90 && Math.abs(num2) <= 180) || (Math.abs(num2) <= 90 && Math.abs(num1) <= 180)) {
          lat = Math.abs(num1) <= 90 ? num1.toString() : num2.toString();
          lon = Math.abs(num2) <= 180 ? num2.toString() : num1.toString();
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
