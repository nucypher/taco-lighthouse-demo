import { Header } from "@/components/Header";

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onUploadSuccess?: () => void;
}

export const Layout = ({ children, onSearch, onUploadSuccess }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={onSearch} onUploadSuccess={onUploadSuccess} />
      <main className="container mx-auto px-2 sm:px-4 pt-20 md:pt-24 pb-16">
        {children}
      </main>
    </div>
  );
};
