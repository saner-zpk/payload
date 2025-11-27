#!/usr/bin/env node
import RSSParser from 'rss-parser';
import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parser = new RSSParser();

const RSS_FEEDS = (process.env.SEED_RSS_FEEDS || 'https://rsshub.app/tech/techcrunch').split(',');
const LIMIT = parseInt(process.env.SEED_NEWS_LIMIT || '5', 10);
const API_URL = process.env.SEED_API_URL || 'http://localhost:3000/api/collections/posts';
const SEED_API_AUTH_HEADER = process.env.SEED_API_AUTH_HEADER || '';
const SEED_API_TOKEN = process.env.SEED_API_TOKEN || '';
const DB_URI = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blooog';

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function tryApiUpsert(item) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (SEED_API_AUTH_HEADER) {
      // support format: "Header-Name: value"
      const sepIndex = SEED_API_AUTH_HEADER.indexOf(':');
      if (sepIndex > -1) {
        const name = SEED_API_AUTH_HEADER.slice(0, sepIndex).trim();
        const value = SEED_API_AUTH_HEADER.slice(sepIndex + 1).trim();
        if (name && value) headers[name] = value;
      } else {
        // fallback to Authorization if only token provided here
        headers['Authorization'] = SEED_API_AUTH_HEADER;
      }
    } else if (SEED_API_TOKEN) {
      headers['Authorization'] = `Bearer ${SEED_API_TOKEN}`;
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// Reuse a single MongoClient for the whole run to avoid connect/close per item
let _client = null;
async function ensureClient() {
  if (_client) return _client;
  _client = new MongoClient(DB_URI, { maxPoolSize: 5 });
  await _client.connect();
  return _client;
}

async function dbUpsertWithClient(client, doc) {
  const db = client.db(); // use DB from connection string if present
  const col = db.collection('posts');
  const now = new Date();
  const update = {
    $set: {
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      _status: doc._status || 'published',
      publishedAt: doc.publishedAt || now,
      updatedAt: now,
    },
    $setOnInsert: { createdAt: now },
  };
  const result = await col.findOneAndUpdate({ slug: doc.slug }, update, { upsert: true, returnDocument: 'after' });
  if (result && result.value) return result.value;
  // fallback: try to fetch the doc
  return await col.findOne({ slug: doc.slug });
}

async function closeClient() {
  if (_client) {
    try { await _client.close(); } catch (e) { /* ignore */ }
    _client = null;
  }
}

async function run() {
  console.log('Fetching RSS feeds:', RSS_FEEDS);
  const items = [];
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const entry of feed.items || []) {
        items.push({
          title: entry.title || entry.contentSnippet || 'untitled',
          link: entry.link,
          isoDate: entry.isoDate ? new Date(entry.isoDate) : new Date(),
          content: entry.contentSnippet || entry.content || entry.summary || '',
        });
      }
    } catch (err) {
      console.warn('Failed to fetch', feedUrl, err.message || err);
    }
  }

  items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
  const slice = items.slice(0, LIMIT);
  console.log(`Found ${items.length} items, seeding top ${slice.length}`);

  for (const it of slice) {
    const title = it.title;
    const slug = slugify(title).slice(0, 200) || `news-${Date.now()}`;
    const doc = {
      title,
      slug,
      _status: 'published',
      publishedAt: it.isoDate,
      content: [ { type: 'p', children: [ { text: it.content || it.title } ] } ],
      externalUrl: it.link,
    };

    console.log('Upserting:', title);
    try {
      // Try API first
      try {
        const apiRes = await tryApiUpsert(doc);
        console.log('API upsert ok:', apiRes?.doc?._id ?? apiRes);
        continue;
      } catch (err) {
        console.warn('API upsert failed, falling back to DB:', err.message || err);
      }

      const client = await ensureClient();
      const dbRes = await dbUpsertWithClient(client, doc);
      if (dbRes && dbRes._id) console.log('DB upsert result:', dbRes._id.toString());
      else console.log('DB upsert result (no _id):', dbRes);
    } catch (err) {
      console.error('Upsert error for', title, err.message || err);
    }
  }
  // close the client once all upserts are done
  await closeClient();
}

run().catch(err => { console.error(err); process.exitCode = 1; });
