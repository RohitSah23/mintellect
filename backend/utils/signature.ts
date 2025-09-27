import { ethers } from 'ethers';

/**
 * Sign a message using a private key (ethers.js v6)
 * @param message - The message to sign (string or bytes)
 * @param privateKey - The private key to sign with (0x...)
 * @returns The signature string (0x...)
 */
export async function signMessage(message: string, privateKey: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    // ethers v6: signMessage expects string or Uint8Array
    return await wallet.signMessage(message);
}
