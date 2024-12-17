import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <div className="relative h-[500px] rounded-lg overflow-hidden mb-8">
      <img
        src="/lovable-uploads/b6aa6f72-35e6-4520-91b5-c26057527313.png"
        alt="Featured Track"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 glass-overlay">
        <div className="container h-full flex flex-col justify-end p-8">
          <h2 className="text-4xl font-bold mb-2">Singing in the Rain</h2>
          <p className="text-xl text-muted-foreground mb-4">Candy Cane</p>
          <Button className="w-fit">Start Listening</Button>
        </div>
      </div>
    </div>
  );
};