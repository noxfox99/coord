import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

function ImageParserApp() {
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '', alt: '', address: '' });
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

  const cleanOCRText = (text) => {
    return text.replace(/[\n\r]+/g, ' ').replace(/[^\d.,A-Za-zА-Яа-я\s/()]+/g, '').trim();
  };

  const parseCoordinates = () => {
    if (!image) return;
    setProcessing(true);
    Tesseract.recognize(
      image,
      'rus+eng',
      { logger: (m) => console.log(m) }
    ).then(({ data: { text } }) => {
      console.log('Raw OCR Result:', text);

      // Clean the OCR text to reduce noise
      const cleanedText = cleanOCRText(text);
      console.log('Cleaned OCR Result:', cleanedText);

      const coordRegex = /(-?\d{1,3}[.,]\d+)[\s,;]+(-?\d{1,3}[.,]\d+)[^\d]*(\d+\s*m)/;
      const addressRegex = /[А-Яа-яA-Za-z\s.,/]+\d+\/\d*,\s*[А-Яа-яA-Za-z\s]+,\s*\d+/;

      const coordMatch = cleanedText.match(coordRegex);
      const addressMatch = cleanedText.match(addressRegex);

      if (coordMatch) {
        const lat = coordMatch[1].replace(',', '.');
        const lon = coordMatch[2].replace(',', '.');
        const alt = coordMatch[3];
        const address = addressMatch ? addressMatch[0] : 'Address not found';
        setCoordinates({ lat, lon, alt, address });
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
      <h1 className="text-xl font-bold mb-2">Image Latitude, Longitude, and Address Parser</h1>
      <input type="file" onChange={handleImageUpload} className="mb-4" />
      {image && <img src={image} alt="Uploaded" className="mb-4 rounded" />}
      <button onClick={parseCoordinates} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={processing}>
        {processing ? 'Processing...' : 'Parse Coordinates'}
      </button>
      {coordinates.lat && coordinates.lon && (
        <div className="mt-2">
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lon}</p>
          <p>Altitude: {coordinates.alt}</p>
          <p>Address: {coordinates.address}</p>
        </div>
      )}
    </div>
  );
}

export default ImageParserApp;
