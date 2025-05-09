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

  const preprocessImage = (src, callback) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cropY = img.height * 0.8;
      const cropHeight = img.height * 0.2;

      canvas.width = img.width;
      canvas.height = cropHeight;

      // Apply filters for contrast and grayscale
      ctx.filter = 'contrast(150%) brightness(110%) grayscale(100%)';
      ctx.drawImage(img, 0, cropY, img.width, cropHeight, 0, 0, img.width, cropHeight);

      const preprocessedDataURL = canvas.toDataURL();
      callback(preprocessedDataURL);
    };
  };

  const cleanOCRText = (text) => {
    return text.replace(/[\n\r]+/g, ' ').replace(/[^\d.,A-Za-zА-Яа-я\s/()°±-]+/g, '').trim();
  };

  const parseCoordinates = () => {
    if (!image) return;
    setProcessing(true);

    preprocessImage(image, (processedImage) => {
      Tesseract.recognize(processedImage, 'rus+eng', {
        tessedit_char_whitelist: '0123456789.,±мМул- ',
        logger: (m) => console.log(m),
      }).then(({ data: { text } }) => {
        console.log('Raw OCR Result:', text);

        const cleanedText = cleanOCRText(text);
        console.log('Cleaned OCR Result:', cleanedText);

        const latLonRegex = /(\d{2}[.,]\d{5})\s*[,; ]\s*(\d{2}[.,]\d{5})/;
        const altRegex = /(?:высота|altitude)?\s*([±]?\d+)\s*[мm]/i;
        const addressRegex = /ул\.\s?[А-Яа-яA-Za-z0-9\s/]+,\s?[А-Яа-я\s]+,\s?\d{5,6}/;

        const latLonMatch = cleanedText.match(latLonRegex);
        const altMatch = cleanedText.match(altRegex);
        const addressMatch = cleanedText.match(addressRegex);

        if (latLonMatch) {
          const lat = latLonMatch[1].replace(',', '.');
          const lon = latLonMatch[2].replace(',', '.');
          const alt = altMatch ? `${altMatch[1]} m` : 'Not found';
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
          <p><strong>Latitude:</strong> {coordinates.lat}</p>
          <p><strong>Longitude:</strong> {coordinates.lon}</p>
          <p><strong>Altitude:</strong> {coordinates.alt}</p>
          <p><strong>Address:</strong> {coordinates.address}</p>
        </div>
      )}
    </div>
  );
}

export default ImageParserApp;
