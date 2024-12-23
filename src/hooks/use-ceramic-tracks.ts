import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Mock data for development
const mockTracks = [
  {
    id: '1',
    title: 'Sample Track 1',
    ipfsCid: 'mock-cid-1',
    owner: 'mock-owner-1',
    artwork: 'mock-artwork-1'
  },
  {
    id: '2',
    title: 'Sample Track 2',
    ipfsCid: 'mock-cid-2',
    owner: 'mock-owner-2',
    artwork: 'mock-artwork-2'
  }
];

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      console.log('Fetching mock tracks...');
      return mockTracks;
    }
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      ipfsCid, 
      artworkCid 
    }: { 
      title: string; 
      ipfsCid: string; 
      artworkCid?: string 
    }) => {
      console.log('Creating mock track...', { title, ipfsCid, artworkCid });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTrack = {
        id: Math.random().toString(),
        title,
        ipfsCid,
        owner: 'mock-owner',
        artwork: artworkCid
      };

      toast({
        title: "Track created",
        description: "Your track has been created successfully.",
      });

      return newTrack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    }
  });
}