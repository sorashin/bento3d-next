const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const NOTION_API_URL = 'https://api.notion.com/v1/pages';
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const BUCKET_NAME = process.env.BUCKET_NAME;

const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

app.post('/addNotionItem', upload.single('photo'), async (req, res) => {
  const { feedback, rating } = req.body;
  const file = req.file;

  if (!feedback && typeof rating !== 'string') {
    return res.status(400).send({ error: 'Missing fields' });
  }

  let imageUrl = null;

  if (file) {
    const fileName = `uploads/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
    });

    blobStream.end(file.buffer);

    await new Promise((resolve, reject) => {
    blobStream.on('finish', resolve);
    blobStream.on('error', reject);
    });

    imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
  }

  const properties = {
    ...(feedback && {
      Feedback: { rich_text: [{ text: { content: feedback } }] }
    }),
    ...(rating && {
      Rating: { number: Number(rating) }
    }),
    ...(imageUrl && {
      Photo: { url: imageUrl }
    }),
  };

  try {
    const notionRes = await axios.post(
      NOTION_API_URL,
      {
        parent: { database_id: DATABASE_ID },
        properties,
      },
      {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
      }
    );

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send({ message: 'Success', data: notionRes.data });
  } catch (error) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(500).send({ error: 'Notion Error', detail: error.response?.data || error.message });
  }
});

app.options('/addNotionItem', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send('');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});