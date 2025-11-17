require('dotenv').config();

const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const path = require('path');
const Stripe = require('stripe');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const NOTION_API_URL = 'https://api.notion.com/v1/pages';
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const ORDERS_DATABASE_ID = process.env.ORDERS_DATABASE_ID; // New database for orders
const BUCKET_NAME = process.env.BUCKET_NAME;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);
const stripe = new Stripe(STRIPE_SECRET_KEY);

app.post('/addNotionItem', upload.single('photo'), async (req, res) => {
  const { feedback, rating } = req.body;
  const file = req.file;

  if (!feedback && typeof rating !== 'string') {
    return res.status(400).send({ error: 'Missing fields' });
  }

  let imageUrl = null;

  if (file) {
    const sanitize = (name) =>
      name.normalize("NFKD")
          .replace(/[^\x00-\x7F]/g, '') // remove non-ASCII
          .replace(/\s+/g, '-');        // spaces to hyphens

    const safeName = sanitize(file.originalname);
    const fileName = `uploads/${Date.now()}-${safeName}`;//force convert to ASCII file name
    
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

// Load pricing table
const pricingTable = JSON.parse(fs.readFileSync(path.join(__dirname, 'pricing-table.json'), 'utf8'));

// Calculate price based on dimensions
function calculatePrice(width, depth, height) {
  // Validate height
  if (height > 100) {
    throw new Error('Height exceeds maximum limit of 100mm');
  }

  // Validate width and depth
  if (width > 400 || depth > 400) {
    throw new Error('Width or depth exceeds maximum limit of 400mm');
  }

  // Select table based on height
  const table = height <= 50 ? pricingTable.z50 : pricingTable.z100;

  // Available sizes
  const sizes = [100, 150, 200, 250, 300, 350, 400];

  // Find the next larger or equal size
  const targetWidth = sizes.find(s => s >= width);
  const targetDepth = sizes.find(s => s >= depth);

  if (!targetWidth || !targetDepth) {
    throw new Error('Size not found in pricing table');
  }

  // Get price from table
  const key = `${targetWidth}x${targetDepth}`;
  const price = table[key];

  if (!price) {
    throw new Error(`Price not found for size ${key}`);
  }

  return price;
}

// New endpoint: Create Stripe Checkout Session
app.post('/createCheckoutSession', upload.single('stl'), async (req, res) => {
  try {
    const { width, depth, height } = req.body;
    const file = req.file;

    if (!file || !width || !depth || !height) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    // Parse dimensions
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const h = parseFloat(height);

    // Calculate price
    let price;
    try {
      price = calculatePrice(w, d, h);
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }

    // Upload STL to GCS
    const fileName = `orders/${Date.now()}-W${w}xD${d}xH${h}.stl`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: 'application/octet-stream',
    });

    blobStream.end(file.buffer);

    await new Promise((resolve, reject) => {
      blobStream.on('finish', resolve);
      blobStream.on('error', reject);
    });

    const fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `Bento3d Tray (${w}x${d}x${h})`,
              description: `3D printed tray - Width: ${w}mm, Depth: ${d}mm, Height: ${h}mm`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',

      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: [
          'US', // United States
          // Asia (excluding Japan)
          'CN', 'KR', 'SG', 'TW', 'HK', 'TH', 'MY', 'ID', 'PH', 'VN', 'IN',
          // Major European countries
          'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'AT', 'CH', 'IE', 'PT', 'PL', 'CZ', 'GR'
        ],
      },

      // Collect phone number
      phone_number_collection: {
        enabled: true,
      },

      success_url: `${FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/order/cancel`,
      metadata: {
        width: w.toString(),
        depth: d.toString(),
        height: h.toString(),
        fileUrl: fileUrl,
      },
    });

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(500).send({ error: 'Internal server error', detail: error.message });
  }
});

app.options('/createCheckoutSession', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send('');
});

// Stripe Webhook endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // For local testing without webhook secret
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Retrieve full session details with shipping info
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer', 'line_items'],
      });

      const shippingDetails = fullSession.shipping_details || fullSession.shipping;
      const customerDetails = fullSession.customer_details;

      // Prepare Notion properties
      const properties = {
        'Order ID': {
          title: [{ text: { content: session.id } }]
        },
        'Customer Name': {
          rich_text: [{ text: { content: shippingDetails?.name || customerDetails?.name || 'N/A' } }]
        },
        'Email': {
          email: customerDetails?.email || ''
        },
        'Phone': {
          phone_number: customerDetails?.phone || shippingDetails?.phone || ''
        },
        'Address Line 1': {
          rich_text: [{ text: { content: shippingDetails?.address?.line1 || '' } }]
        },
        'Address Line 2': {
          rich_text: [{ text: { content: shippingDetails?.address?.line2 || '' } }]
        },
        'City': {
          rich_text: [{ text: { content: shippingDetails?.address?.city || '' } }]
        },
        'State': {
          rich_text: [{ text: { content: shippingDetails?.address?.state || '' } }]
        },
        'Postal Code': {
          rich_text: [{ text: { content: shippingDetails?.address?.postal_code || '' } }]
        },
        'Country': {
          rich_text: [{ text: { content: shippingDetails?.address?.country || '' } }]
        },
        'Product Size': {
          rich_text: [{ text: { content: `${session.metadata.width}x${session.metadata.depth}x${session.metadata.height}mm` } }]
        },
        'Price': {
          number: session.amount_total / 100
        },
        'STL File URL': {
          url: session.metadata.fileUrl
        },
      };

      // Save to Notion
      await axios.post(
        NOTION_API_URL,
        {
          parent: { database_id: ORDERS_DATABASE_ID },
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

      console.log('Order saved to Notion:', session.id);
    } catch (error) {
      console.error('Error saving to Notion:', error.response?.data || error.message);
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});