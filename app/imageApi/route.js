import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const POST = async (req) => {
  try {
    const { data } = await req.json(); 
    
    
    const uploadResponse = await cloudinary.uploader.upload(data, {
      upload_preset: 'ifndk7tr', 
    });

    return new Response(JSON.stringify({ url: uploadResponse.secure_url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong with image upload' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};