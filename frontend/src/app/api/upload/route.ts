import { NextResponse } from 'next/server';
import axios from 'axios';

// this route handles file uploads and forwards them to Pinata for IPFS storage.
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // make new FormData to send to Pinata API
        const pinataFormData = new FormData();
        pinataFormData.append('file', file);

        // send the file to Pinata and save the response
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            pinataFormData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`,
                    // 'Content-Type': `multipart/form-data` // axios sets this automatically with FormData
                },
            }
        );

        // return ipfs hash(CID) from Pinata response
        const ipfsHash = response.data.IpfsHash;
        return NextResponse.json({ ipfsHash }, { status: 200 });

    } catch (error) {
        console.error('IPFS upload error:', error);
        return NextResponse.json({ error: 'Error uploading file to IPFS' }, { status: 500 });
    }
}