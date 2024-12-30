import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { orbisdb } from "@/integrations/orbis/client";

const USER_MODEL_ID = "kjzl6hvfrbw6c7j8otyyccaetle63o1m27zafs06csb24bljk1imyns9klda994";
const ORBIS_CONTEXT_ID = "kjzl6kcym7w8y99fn4i5nup6v978x6wcpox2dem4pmqz9dk1ex1ts0v41tfypea";

interface OrbisUser {
  stream_id: string;
  name: string;
  avatar?: string;
  createdAt: string | null;
}

export default function Profile() {
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<OrbisUser | null>(null);
  const address = wallet?.accounts?.[0]?.address;
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  useEffect(() => {
    async function fetchUserProfile() {
      if (!address) return;
      
      try {
        console.log('Fetching user profile from OrbisDB...');
        const { rows } = await orbisdb
          .select()
          .from(USER_MODEL_ID)
          .where({ name: address })
          .context(ORBIS_CONTEXT_ID)
          .run();

        if (rows && rows.length > 0) {
          console.log('User profile found:', rows[0]);
          setUserData(rows[0] as OrbisUser);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [address]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
              <AvatarImage src={userData?.avatar || ""} alt="Profile picture" />
              <AvatarFallback>{truncatedAddress.slice(0, 2).toUpperCase()}</AvatarFallback>
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
              {userData?.stream_id || 'Not available'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <p className="text-sm text-muted-foreground">
              {userData?.createdAt 
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'Not available'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}