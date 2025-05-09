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
    return text.replace(/[\n\r]+/g, ' ')
               .replace(/[^\d.,A-Za-zА-Яа-я\s/()°]+/g, '')
               .trim();
  };

  const preprocessImage = (src, callback) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const cropY = img.height * 0.7; // bottom 30%
      const cropHeight = img.height * 0.3;

      canvas.width = img.width;
      canvas.height = cropHeight;

      ctx.imageSmoothingEnabled = false;
      ctx.filter = 'contrast(200%) brightness(120%) grayscale(100%)';
      ctx.drawImage(img, 0, cropY, img.width, cropHeight, 0, 0, img.width, cropHeight);

      const preprocessedDataURL = canvas.toDataURL();
      callback(preprocessedDataURL);
    };
  };

  const parseCoordinates = () => {
    if (!image) return;
    setProcessing(true);

    preprocessImage(image, (preprocessed) => {
      Tesseract.recognize(
        preprocessed,
        'rus+eng',
        { logger: (m) => console.log(m) }
      ).then(({ data: { text } }) => {
        console.log('Raw OCR Result:', text);

        const cleanedText = cleanOCRText(text);
        console.log('Cleaned OCR Result:', cleanedText);

        const coordRegex = /(-?\d{1,3}[.,]\d+)[\s]()
