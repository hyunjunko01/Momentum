import { NextResponse } from 'next/server';
import axios from 'axios';

// 이 API 라우트는 사용자가 업로드한 파일을 받아서 Pinata로 전달하는 '안전한 중개자' 역할을 합니다.
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Pinata API로 보낼 새로운 FormData를 만듭니다.
        const pinataFormData = new FormData();
        pinataFormData.append('file', file);

        // Pinata API 호출
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            pinataFormData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`,
                    // 'Content-Type': `multipart/form-data`는 axios가 자동으로 설정해 줍니다.
                },
            }
        );

        // Pinata로부터 IPFS 해시(CID)를 받아 프론트엔드로 반환합니다.
        const ipfsHash = response.data.IpfsHash;
        return NextResponse.json({ ipfsHash }, { status: 200 });

    } catch (error) {
        console.error('IPFS upload error:', error);
        return NextResponse.json({ error: 'Error uploading file to IPFS' }, { status: 500 });
    }
}