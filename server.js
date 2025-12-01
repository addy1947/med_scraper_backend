import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { scrape1mg } from './tool/1mg.js';
import { scrapeApollo } from './tool/apollo.js';
import { savePharmEasyHtml } from './tool/pharmeasy.js';
import { saveTrueMedSearch } from './tool/truemed.js';
import { saveNetMedHtml } from './tool/netmed.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkPharmEasyPincode } from './pincode/01_pharmeasy.js';
import { checkTrueMedPincode } from './pincode/01_truemed.js';
import { checkApolloServiceability } from './pincode/01_apoolo.js';
import { check1mgServiceability } from './pincode/01_1mg.js';
import { checkNetMedsPincode } from './pincode/01_netmed.js';
import multer from 'multer';
import { extractMedicines } from './ocr/gemini.js';

const upload = multer({ storage: multer.memoryStorage() });


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/message', async (req, res) => {
  const { message, maxProduct } = req.body;
  console.log('Received:', message, 'maxProduct:', maxProduct);

  if (!message || !message.trim()) {
    return res.status(400).json({ result: 'Please provide a medicine name.' });
  }

  // Checklist: maxProduct must be between 1 and 10
  if (typeof maxProduct !== 'number' || maxProduct < 1 || maxProduct > 10) {
    return res.status(400).json({
      success: false,
      message: 'maxProduct must be between 1 and 10',
      data: { oneMg: [], apollo: [] }
    });
  }

  const maxCount = maxProduct;
  const trimmedQuery = message.trim();
  const [oneMgResult, apolloResult, pharmEasyResult, truemedResult, netmedResult] = await Promise.all([
    scrape1mg(trimmedQuery, maxCount),
    scrapeApollo(trimmedQuery, maxCount),
    savePharmEasyHtml(trimmedQuery, { maxProduct: maxCount }),
    saveTrueMedSearch(trimmedQuery),
    saveNetMedHtml(trimmedQuery)
  ]);

  const pharmEasyProducts = Array.isArray(pharmEasyResult.data)
    ? pharmEasyResult.data.slice(0, maxCount)
    : [];

  // Transform TrueMeds data to match frontend format and limit by maxCount
  const truemedProducts = Array.isArray(truemedResult.data)
    ? truemedResult.data.slice(0, maxCount).map(product => ({
      name: product.skuName || '',
      price: product.sellingPrice || null,
      mrp: product.mrp || null,
      discount: product.discount ? `${product.discount}%` : null,
      measurement: product.packForm || '',
      image: product.productImageUrl ? product.productImageUrl.split(',')[0] : null,
      url: product.productUrlSuffix ? `https://www.truemeds.in/${product.productUrlSuffix}` : null,

    }))
    : [];

  const netmedProducts = Array.isArray(netmedResult.data)
    ? netmedResult.data.slice(0, maxCount)
    : [];

  res.json({
    success: oneMgResult.success || apolloResult.success || pharmEasyResult.success || truemedResult.success || netmedResult.success,
    message: `1mg: ${oneMgResult.products} products, Apollo: ${apolloResult.products} products, PharmEasy: ${pharmEasyProducts.length} products, TrueMeds: ${truemedProducts.length} products, NetMeds: ${netmedProducts.length} products`,
    data: {
      oneMg: oneMgResult.data,
      apollo: apolloResult.data,
      pharmEasy: pharmEasyProducts,
      truemed: truemedProducts,
      netmed: netmedProducts
    },
    meta: {
      pharmEasy: {
        htmlOutputPath: pharmEasyResult.htmlOutputPath,
        jsonOutputPath: pharmEasyResult.jsonOutputPath
      }
    }
  });
});





app.post('/api/pincode', async (req, res) => {
  const { pincode, lat, lon } = req.body;
  console.log(`Received request: Pincode=${pincode}, Lat=${lat}, Lon=${lon}`);

  if (!pincode && (!lat || !lon)) {
    return res.status(400).json({ success: false, message: 'Either Pincode or Location (lat, lon) is required' });
  }

  const [pharmeasyResult, truemedResult, netmedResult] = await Promise.all([
    checkPharmEasyPincode(pincode),
    checkTrueMedPincode(pincode),
    checkNetMedsPincode(pincode)
  ]);

  let apolloResult = null;
  let oneMgResult = null;
  if (lat && lon) {
    [apolloResult, oneMgResult] = await Promise.all([
      checkApolloServiceability(lat, lon),
      check1mgServiceability(lat, lon)
    ]);
  }

  res.json({
    pharmeasy: pharmeasyResult,
    truemed: truemedResult,
    netmed: netmedResult,
    apollo: apolloResult,
    oneMg: oneMgResult
  });
});

app.post('/api/extract-medicines', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    console.log('Processing prescription image...');
    const medicines = await extractMedicines(req.file.buffer, req.file.mimetype);
    console.log('Extracted medicines:', medicines);

    res.json({ success: true, data: medicines });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ success: false, message: 'Failed to extract medicines' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
