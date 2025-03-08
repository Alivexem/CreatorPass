export const uploadToIPFS = async (file: File): Promise<string> => {
  console.log('Starting IPFS file upload...', { fileName: file.name, fileSize: file.size });
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Sending file to upload endpoint...');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('IPFS upload failed:', response.status, response.statusText);
      throw new Error('Failed to upload to IPFS');
    }

    const data = await response.json();
    console.log('IPFS upload successful:', data.url);
    return data.url;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

export const uploadMetadataToIPFS = async (
  imageUrl: string, 
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    price: number;  // Added price field
    attributes: Array<{
      trait_type: string;
      value: string | boolean | number;
    }>;
  }
): Promise<string> => {
  console.log('Starting metadata upload...', { metadata });
  
  try {
    console.log('Sending metadata to upload endpoint...');
    const response = await fetch('/api/upload', { // Changed from /api/upload-metadata
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      console.error('Metadata upload failed:', response.status, response.statusText);
      throw new Error('Failed to upload metadata');
    }

    const data = await response.json();
    console.log('Metadata upload successful:', data.url);
    return data.url;
  } catch (error) {
    console.error('Metadata upload error:', error);
    throw error;
  }
};