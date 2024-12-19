import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WalletButton } from "./auth/WalletButton";
import { UploadButton } from "./upload/UploadButton";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onUploadSuccess?: () => void;
}

export const Header = ({ onSearch, onUploadSuccess }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[2px] border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-8 flex-1">
          <Link to="/" className="text-xl font-bold tracking-tight whitespace-nowrap">TACo</Link>
          <div className="relative flex-1 max-w-[400px] hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              className="pl-10 bg-secondary rounded-full border-0 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <UploadButton onUploadSuccess={onUploadSuccess} />
          <WalletButton />
        </div>
      </div>

      <div className="sm:hidden border-t border-border">
        <div className="container mx-auto px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              className="pl-10 bg-secondary rounded-full border-0 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
    </header>
  );
};