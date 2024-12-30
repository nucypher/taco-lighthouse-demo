import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Edit2, User, Clock, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatWalletAddress } from "@/utils/format";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { orbisdb } from "@/integrations/orbis/base-client";

export default function Profile() {
  const { wallet } = useWallet();
  const { orbisUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(orbisUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  
  console.log('Profile page - Current state:', { 
    orbisUser, 
    isLoading,
    wallet: wallet?.accounts?.[0]?.address 
  });
  
  const address = wallet?.accounts?.[0]?.address;
  const truncatedAddress = address ? formatWalletAddress(address) : "Not connected";

  const handleSave = async () => {
    if (!orbisUser?.id) {
      toast.error("User not found");
      return;
    }

    try {
      setIsSaving(true);
      console.log('Saving profile changes...', { 
        editedName, 
        userId: orbisUser.id 
      });

      await orbisdb
        .update(orbisUser.id)
        .set({
          name: editedName,
          updated_at: new Date().toISOString()
        })
        .run();

      // Add a small delay to ensure the update is processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(orbisUser?.name || '');
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orbisUser) {
    return (
      <div className="container max-w-2xl py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No profile found. Please connect your wallet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={orbisUser?.avatar_url || ""} alt={orbisUser?.name || 'Profile picture'} />
                <AvatarFallback>
                  <User className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0 flex-1">
                {isEditing ? (
                  <Input 
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="max-w-[200px]"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold truncate pr-2">
                    {orbisUser?.name || truncatedAddress}
                  </h1>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  Profile Details
                </p>
              </div>
            </CardTitle>
            <div className="flex gap-2 shrink-0 ml-4">
              {isEditing ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
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
            <p className="font-mono text-sm truncate">
              {orbisUser?.controller || truncatedAddress}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Updated
            </Label>
            <p className="text-sm text-muted-foreground">
              {orbisUser?.updated_at 
                ? new Date(orbisUser.updated_at).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}