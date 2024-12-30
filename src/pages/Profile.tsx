import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Edit2, User, Clock, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatWalletAddress } from "@/utils/format";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const { wallet } = useWallet();
  const { orbisUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  console.log('Profile page - Current Orbis user:', orbisUser);
  
  const address = wallet?.accounts?.[0]?.address;
  const truncatedAddress = address ? formatWalletAddress(address) : "Not connected";
  const lastUpdated = orbisUser?.updated_at 
    ? new Date(orbisUser.updated_at).toLocaleDateString()
    : "Not available";

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={orbisUser?.avatar_url || ""} alt={orbisUser?.name || 'Profile picture'} />
                <AvatarFallback>
                  <User className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0">
                {isEditing ? (
                  <Input 
                    defaultValue={orbisUser?.name || truncatedAddress}
                    className="max-w-[200px]"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold truncate">
                    {orbisUser?.name || truncatedAddress}
                  </h1>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  Profile Details
                </p>
              </div>
            </CardTitle>
            <div className="flex gap-2 shrink-0">
              {isEditing ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(false)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Controller
            </Label>
            {isEditing ? (
              <Input 
                defaultValue={orbisUser?.controller || truncatedAddress}
                className="font-mono text-sm"
              />
            ) : (
              <p className="font-mono text-sm truncate">{orbisUser?.controller || truncatedAddress}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Updated
            </Label>
            <p className="text-sm text-muted-foreground">
              {lastUpdated}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}