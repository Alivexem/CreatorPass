import cloudinary from 'cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req) => {
  try {
    const { data, mediaType } = await req.json();

    // Validate the base64 data
    if (!data) {
      return new Response(JSON.stringify({ error: 'No media data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Configure upload options based on media type
    const uploadOptions = {
      upload_preset: 'ifndk7tr',
      resource_type: mediaType === 'video' ? 'video' : 'image',
    };

    // For videos, add these additional options
    if (mediaType === 'video') {
      Object.assign(uploadOptions, {
        chunk_size: 6000000, // 6MB chunks
        eager: [
          { format: 'mp4', transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]}
        ],
        eager_async: true
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(data, uploadOptions);

    return new Response(JSON.stringify({ url: uploadResponse.secure_url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};