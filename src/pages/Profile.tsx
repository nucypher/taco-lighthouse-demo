import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";

export default function Profile() {
  const { wallet } = useWallet();
  const address = wallet?.accounts?.[0]?.address;
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  return (
    <div className="container max-w-2xl py-10">
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
            <Label>Tracks Uploaded</Label>
            <p className="text-sm text-muted-foreground">0 tracks</p>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}