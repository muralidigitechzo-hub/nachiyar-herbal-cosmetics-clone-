export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  }
};

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { image, filename } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data required' });
    }

    // In serverless, return the image data URL directly or path
    return res.status(200).json({
      success: true,
      url: image,
      filename: filename || 'uploaded_image.png'
    });
  } catch (error) {
    console.error('Error in /api/upload:', error);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
}
