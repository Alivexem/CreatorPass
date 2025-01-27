import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import FormData from 'form-data';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type');
        
        // Handle JSON metadata
        if (contentType?.includes('application/json')) {
            const metadata = await req.json();
            
            const res = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                metadata,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
                    },
                }
            );

            return NextResponse.json({ 
                url: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}` 
            });
        }
        
        // Handle file uploads
        const data = await req.formData();
        const file = data.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const formData = new FormData();
        formData.append('file', buffer, file.name);

        const res = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                    'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                    'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
                },
            }
        );

        return NextResponse.json({ 
            url: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}` 
        });

    } catch (error) {
        console.error('Upload error:', error);
        if (axios.isAxiosError(error)) {
            console.error('Pinata response:', error.response?.data);
        }
        return NextResponse.json(
            { error: 'Error uploading to IPFS' }, 
            { status: 500 }
        );
    }
} 