import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatWalletAddress } from "@/utils/format";

export default function Profile() {
  const { wallet } = useWallet();
  const { orbisUser } = useAuth();
  
  const address = wallet?.accounts?.[0]?.address;
  const truncatedAddress = address ? formatWalletAddress(address) : "Not connected";
  const memberSince = orbisUser?.created_at 
    ? new Date(orbisUser.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="container max-w-2xl py-10 relative">
      <Link 
        to="/" 
        className="absolute top-4 left-4"
      >
        <Button variant="ghost" size="icon">
          <Home className="h-5 w-5" />
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt="Profile picture" />
              <AvatarFallback>UP</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">User Profile</h1>
              <p className="text-sm text-muted-foreground">
                Manage your profile settings
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <p className="font-mono text-sm">{truncatedAddress}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Stream ID</Label>
            <p className="font-mono text-sm break-all">
              {orbisUser?.id || 'Not available'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <p className="text-sm text-muted-foreground">
              {memberSince}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}