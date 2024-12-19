export function logWalletEvent(event: string, data?: any) {
  console.log(`[WALLET] ${event}`, data ? data : '');
}

export function storeWalletState(wallet: any) {
  if (wallet) {
    localStorage.setItem('connectedWallet', JSON.stringify(wallet));
    logWalletEvent('Stored wallet state in localStorage:', wallet);
  } else {
    localStorage.removeItem('connectedWallet');
    logWalletEvent('Removed wallet from localStorage');
  }
}