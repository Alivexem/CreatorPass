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

export const uploadMetadataToIPFS = async (imageUrl: string, name: string): Promise<string> => {
  const metadata = {
    name: `${name} Access Card`,
    description: `Access Card for ${name}`,
    image: imageUrl,
    attributes: [
      {
        trait_type: "Type",
        value: "Access Card"
      },
      {
        trait_type: "Creator",
        value: name
      }
    ]
  };

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify(metadata),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload metadata to IPFS');
  }

  const data = await response.json();
  return data.url;
}; 