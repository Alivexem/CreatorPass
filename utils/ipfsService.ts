export const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload to IPFS');
  }

  const data = await response.json();
  return data.url;
};

export const uploadMetadataToIPFS = async (
  imageUrl: string, 
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | boolean;
    }>;
  }
): Promise<string> => {
  try {
    const response = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) throw new Error('Failed to upload metadata');
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
};