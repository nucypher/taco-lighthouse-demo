import { composeClient } from "@/integrations/ceramic/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
  Track, 
  TrackQueryResponse, 
  CreateTrackInput, 
  CreateTrackResponse,
  CreateArtworkInput,
  CreateArtworkResponse,
  ComposeDBResponse
} from "@/types/ceramic";

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      console.log('Fetching tracks from ComposeDB...');
      const response = await composeClient.executeQuery<ComposeDBResponse<TrackQueryResponse>>(`
        query {
          trackIndex(first: 100) {
            edges {
              node {
                id
                title
                ipfsCid
                owner {
                  id
                }
                artwork {
                  id
                  ipfsCid
                }
              }
            }
          }
        }
      `);

      console.log('ComposeDB response:', response);

      if (response.errors) {
        throw new Error(response.errors.map(e => e.message).join(', '));
      }

      return response.data.trackIndex.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        ipfsCid: node.ipfsCid,
        owner: node.owner.id,
        artwork: node.artwork?.ipfsCid
      }));
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
      console.log('Creating track in ComposeDB...', { title, ipfsCid, artworkCid });

      // First create artwork if provided
      let artworkId: string | undefined;
      if (artworkCid) {
        const artworkInput: CreateArtworkInput = {
          content: {
            ipfsCid: artworkCid,
            mimeType: "image/jpeg"
          }
        };

        const artworkResponse = await composeClient.executeQuery<ComposeDBResponse<CreateArtworkResponse>>(`
          mutation CreateArtwork($input: CreateArtworkInput!) {
            createArtwork(input: $input) {
              document {
                id
              }
            }
          }
        `, {
          input: artworkInput
        });

        if (artworkResponse.errors) {
          throw new Error(artworkResponse.errors.map(e => e.message).join(', '));
        }

        artworkId = artworkResponse.data.createArtwork.document.id;
      }

      // Then create the track
      const trackInput: CreateTrackInput = {
        content: {
          title,
          ipfsCid,
          ...(artworkId && { artwork: artworkId })
        }
      };

      const response = await composeClient.executeQuery<ComposeDBResponse<CreateTrackResponse>>(`
        mutation CreateTrack($input: CreateTrackInput!) {
          createTrack(input: $input) {
            document {
              id
              title
              ipfsCid
              owner {
                id
              }
              artwork {
                id
                ipfsCid
              }
            }
          }
        }
      `, {
        input: trackInput
      });

      console.log('ComposeDB create response:', response);

      if (response.errors) {
        throw new Error(response.errors.map(e => e.message).join(', '));
      }

      return response.data.createTrack.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    }
  });
}