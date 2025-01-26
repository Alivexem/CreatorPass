const uploadToIPFS = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
      },
      body: formData,
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const uploadMetadataToIPFS = async (imageUrl: string, name: string) => {
  try {
    const metadata = {
      name: `${name} Access Pass`,
      description: `Reown Access Pass for ${name}`,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Type",
          value: "Access Pass"
        },
        {
          trait_type: "Creator",
          value: name
        }
      ]
    };

    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json');

    return await uploadToIPFS(file);
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
};

export { uploadToIPFS }; 