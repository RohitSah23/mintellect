import FormData from 'form-data';
import fetch from 'node-fetch';
export const uploadToFilebase = async (file: Express.Multer.File): Promise<{ ipfsHash: string; ipfsUrl: string }> => {
    const FILEBASE_API_URL = 'https://rpc.filebase.io/api/v0';
    const FILEBASE_API_TOKEN = process.env.FILEBASE_API_TOKEN;

    if (!FILEBASE_API_TOKEN) {
        throw new Error('Filebase API token not configured');
    }

    try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        // Upload to Filebase IPFS
        const response = await fetch(`${FILEBASE_API_URL}/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FILEBASE_API_TOKEN}`,
                ...formData.getHeaders()
            },
            body: formData
        });
        console.log(response)
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Filebase API error:', response.status, errorText);
            throw new Error(`Filebase API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json() as { Hash?: string; hash?: string; cid?: string };

        // Filebase API returns the IPFS hash
        const ipfsHash = result?.Hash || result?.hash || result?.cid;

        if (!ipfsHash) {
            console.error('No IPFS hash in response:', result);
            throw new Error('No IPFS hash returned from Filebase');
        }

        const ipfsUrl = `https://ipfs.filebase.io/ipfs/${ipfsHash}`;

        return {
            ipfsHash,
            ipfsUrl
        };

    } catch (error: any) {
        console.error('Filebase upload error:', error);
        throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
};
export const pinToFilebase = async (ipfsHash: string): Promise<boolean> => {
    const FILEBASE_PIN_API_URL = 'https://api.filebase.io/v1/ipfs/pins';
    const FILEBASE_API_TOKEN = process.env.FILEBASE_API_TOKEN;

    if (!FILEBASE_API_TOKEN) {
        throw new Error('Filebase API token not configured');
    }

    try {
        const response = await fetch(FILEBASE_PIN_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FILEBASE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cid: ipfsHash,
                name: `pin-${Date.now()}`
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Filebase pin error:', response.status, errorText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Pin to Filebase error:', error);
        return false;
    }
};

// Get file info from Filebase
export const getFileInfo = async (ipfsHash: string): Promise<any> => {
    const FILEBASE_API_TOKEN = process.env.FILEBASE_API_TOKEN;
    const FILEBASE_PIN_API_URL = `https://api.filebase.io/v1/ipfs/pins/${ipfsHash}`;

    if (!FILEBASE_API_TOKEN) {
        return null;
    }

    try {
        const response = await fetch(FILEBASE_PIN_API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FILEBASE_API_TOKEN}`
            }
        });

        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Get file info error:', error);
        return null;
    }
};
