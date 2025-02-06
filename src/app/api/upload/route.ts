import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata-web3';

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.PINATA_GATE!
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const cid = (await pinata.upload.file(file)).IpfsHash;
        const uri = `https://azure-nearby-boa-178.mypinata.cloud/ipfs/${cid}`;
        return NextResponse.json({ cid, uri });
    } catch (error) {
        console.log("Error: ", error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}