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
        console.log('Received request with content-type:', contentType);

        // Handle JSON metadata
        if (contentType?.includes('application/json')) {
            console.log('Processing metadata upload...');
            const metadata = await req.json();
            console.log('Metadata received:', metadata);

            const pinataMetadata = {
                name: metadata.name,
                keyvalues: {
                    type: "CreatorPass NFT"
                }
            };

            const pinataBody = {
                pinataMetadata,
                pinataContent: metadata
            };

            console.log('Sending to Pinata...');
            const res = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                pinataBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
                    },
                }
            );
            console.log('Pinata response:', res.data);

            return NextResponse.json({ 
                url: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}` 
            });
        }
        
        // Handle file uploads
        console.log('Processing file upload...');
        const data = await req.formData();
        const file = data.get('file') as File;
        
        if (!file) {
            console.error('No file provided');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: file.name,
            contentType: file.type
        });

        // Add metadata for Pinata
        formData.append('pinataMetadata', JSON.stringify({
            name: file.name,
            keyvalues: {
                type: "CreatorPass Image"
            }
        }));

        console.log('Uploading file to Pinata...');
        const res = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                    'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                    'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
                },
                maxBodyLength: Infinity,
            }
        );
        console.log('Pinata file upload response:', res.data);

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