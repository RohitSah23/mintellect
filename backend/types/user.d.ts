interface User {
    _id?: any,
    email: string;
    created_on: number;
    name: string;
    uid: string;
    updated_on: number;
    signature: string;
    walletAddress: string;
    role: 'user' | 'patent-authority' | 'verification-authority';
}