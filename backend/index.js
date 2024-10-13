const express = require('express');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Get folders from environment variable
const FOLDERS = process.env.ALLOWED_FOLDERS ? process.env.ALLOWED_FOLDERS.split(',') : ['phc', 'insure', 'emr'];

app.get('/api/folders', (req, res) => {
  res.json({ folders: FOLDERS });
});

app.get('/api/list-objects/:folder', async (req, res) => {
  try {
    const folder = req.params.folder;
    if (!FOLDERS.includes(folder)) {
      return res.status(400).json({ error: 'Invalid folder' });
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: `${folder}/`
    });
    
    const response = await s3Client.send(command);
    
    const objects = (response.Contents || [])
      .filter(obj => obj.Key !== `${folder}/`) // Filter out the folder itself
      .map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified
      }));
    
    res.json(objects);
  } catch (error) {
    console.error('Error listing objects:', error);
    res.status(500).json({ error: 'Failed to list objects' });
  }
});

app.get('/api/download/:key(*)', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });
    
    const response = await s3Client.send(command);
    
    res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
    res.setHeader('Content-Type', response.ContentType);
    
    response.Body.pipe(res);
  } catch (error) {
    console.error('Error downloading object:', error);
    res.status(500).json({ error: 'Failed to download object' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
