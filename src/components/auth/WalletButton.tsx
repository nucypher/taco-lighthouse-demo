import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";
import { formatWalletAddress } from "@/utils/format";

export const WalletButton = () => {
  const { login, ready, authenticated } = usePrivy();
  const { wallet } = useWallet();

  // Add logging for component state
  console.log('WalletButton state:', { 
    wallet, 
    ready,
    authenticated,
    connectedAddress: wallet?.accounts?.[0]?.address 
  });

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <Button 
        variant="default"
        disabled
        className="rounded-full font-medium whitespace-nowrap text-sm"
      >
        Loading...
      </Button>
    );
  }

  // Show profile link if authenticated and wallet connected
  if (authenticated && wallet) {
    const connectedAddress = wallet.accounts?.[0]?.address;
    const truncatedAddress = connectedAddress ? formatWalletAddress(connectedAddress) : '';

    return (
      <Link to="/profile">
        <Button variant="secondary" className="rounded-full font-medium">
          {truncatedAddress}
        </Button>
      </Link>
    );
  }

  // Show connect button if not authenticated
  return (
    <Button 
      variant="default"
      onClick={() => login()}
      className="rounded-full font-medium whitespace-nowrap text-sm"
    >
      Connect Wallet
    </Button>
  );
};