import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

export async function connectWallet() {
  try {
    // Request access to the user's Ethereum accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    console.log('Connected address:', address);

    // Get the chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Create SIWE message
    const domain = window.location.host;
    const origin = window.location.origin;
    
    // Create a new SIWE message
    const message = new SiweMessage({
      domain,
      address,
      statement: 'Sign in with Ethereum to the app.',
      uri: origin,
      version: '1',
      chainId: Number(chainId),
      nonce: undefined, // Will be fetched from the backend
    });

    // Get the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Fetch nonce from the backend
    const nonceResponse = await fetch('/functions/v1/nonce', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!nonceResponse.ok) {
      throw new Error('Failed to get nonce');
    }

    const { nonce } = await nonceResponse.json();
    message.nonce = nonce;

    // Get the message to sign
    const messageToSign = message.prepareMessage();

    // Sign the message
    const signature = await signer.signMessage(messageToSign);

    // Verify the signature on the backend
    const authResponse = await fetch('/functions/v1/siwe-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
        redirect_url: `${window.location.protocol}//${window.location.hostname}:8080`, // Use port 8080
      }),
    });

    if (!authResponse.ok) {
      throw new Error('Failed to verify signature');
    }

    const authData = await authResponse.json();
    console.log('SIWE auth successful, received data:', authData);

    // Use the action_link from the session data to complete authentication
    if (authData.session?.action_link) {
      console.log('Redirecting to action link for authentication...');
      // Replace localhost:3000 with the correct port if present
      const actionLink = authData.session.action_link.replace('localhost:3000', 'localhost:8080');
      window.location.href = actionLink;
    } else {
      console.error('No action link received from server');
      throw new Error('Authentication failed: No action link received');
    }

    return {
      label: 'Frame',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDcuNSIgaGVpZ2h0PSIzMDYiIHZpZXdCb3g9IjAgMCAzMDcuNSAzMDYiPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyODI3MmEiPjwvcmVjdD4KICA8cGF0aCBmaWxsPScjMDBkMmJlJyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3NywgNzYuNSkiIGQ9Ik0xNDUuMSw3NS42VjE3LjZjMC01LjEtNC4yLTkuMy05LjMtOS4zaC01OC4xYy0uNiwwLTEuMS0uMi0xLjYtLjZsLTctN2MtLjQtLjQtMS0uNy0xLjYtLjdIOS4zQzQuMiwwLDAsNC4xLDAsOS4zaDB2NThjMCwuNi4yLDEuMS42LDEuNmw3LDdjLjQuNC43LDEsLjcsMS42djU4YzAsNS4xLDQuMiw5LjMsOS4zLDkuM2g1OC4yYy42LDAsMS4xLjIsMS42LjZsNyw3Yy40LjQsMSwuNiwxLjYuNmg1OC4yYzUuMSwwLDkuMy00LjEsOS4zLTkuM2gwdi01OGMwLS42LS4yLTEuMS0uNi0xLjZsLTctN2MtLjUtLjQtLjgtLjktLjgtMS41Wk0xMDUuNiwxMDYuNmgtNTcuN2MtLjcsMC0xLjMtLjYtMS4zLTEuM3YtNTcuNmMwLS43LjYtMS4zLDEuMy0xLjNoNTcuN2MuNywwLDEuMy42LDEuMywxLjN2NTcuNmMuMS43LS41LDEuMy0xLjMsMS4zWiIvPgo8L3N2Zz4K',
      provider: window.ethereum,
      accounts: [address],
    };

  } catch (error) {
    console.error('Error in connectWallet:', error);
    throw error;
  }
}