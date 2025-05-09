import React, { useState } from 'react';

function ImageParserApp() {
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const parseCoordinates = () => {
    const text = `45,04312, 41,90517 (+3м)`; // Placeholder for OCR implementation
    const regex = /([0-9]+,[0-9]+)/g;
    const matches = text.match(regex);
    if (matches && matches.length >= 2) {
      setCoordinates({ lat: matches[0], lon: matches[1] });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Image Latitude and Longitude Parser</h1>
      <input type="file" onChange={handleImageUpload} className="mb-4" />
      {image && <img src={image} alt="Uploaded" className="mb-4 rounded" />}
      <button onClick={parseCoordinates} className="px-4 py-2 bg-blue-500 text-white rounded">Parse Coordinates</button>
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
