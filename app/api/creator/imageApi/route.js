import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { data } = await request.json(); 
    
    const uploadResponse = await cloudinary.uploader.upload(data, {
      upload_preset: 'ifndk7tr', 
    });

    return Response.json({ url: uploadResponse.secure_url });
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return Response.json(
      { error: 'Something went wrong with image upload' }, 
      { status: 500 }
    );
  }
} 