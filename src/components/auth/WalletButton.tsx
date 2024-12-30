import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";
import { formatWalletAddress } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

export const WalletButton = () => {
  const { wallet } = useWallet();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { login } = usePrivy();

  console.log('WalletButton state:', { 
    wallet, 
    isAuthenticated,
    isLoading,
    connectedAddress: wallet?.accounts?.[0]?.address
  });

  if (isLoading) {
    return (
      <Button 
        variant="default"
        disabled
        className="rounded-full font-medium whitespace-nowrap text-sm"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && wallet) {
    const connectedAddress = wallet.accounts?.[0]?.address;
    const truncatedAddress = connectedAddress ? formatWalletAddress(connectedAddress) : '';

    return (
      <div className="flex items-center gap-2">
        <Link to="/profile">
          <Button variant="secondary" className="rounded-full font-medium">
            {truncatedAddress}
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={logout}
          className="rounded-full font-medium"
        >
          Logout
        </Button>
      </div>
    );
  }

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