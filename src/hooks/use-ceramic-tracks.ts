import { composeClient } from "@/integrations/ceramic/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Track {
  id: string;
  title: string;
  ipfsCid: string;
  owner: string;
  artwork?: string;
}

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      console.log('Fetching tracks from ComposeDB...');
      const response = await composeClient.executeQuery(`
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

      return response.data.trackIndex.edges.map(({ node }: any) => ({
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
    mutationFn: async ({ title, ipfsCid, artworkCid }: { title: string; ipfsCid: string; artworkCid?: string }) => {
      console.log('Creating track in ComposeDB...', { title, ipfsCid, artworkCid });

      // First create artwork if provided
      let artworkId;
      if (artworkCid) {
        const artworkResponse = await composeClient.executeQuery(`
          mutation {
            createArtwork(input: {
              content: {
                ipfsCid: "${artworkCid}"
                mimeType: "image/jpeg"
              }
            }) {
              document {
                id
              }
            }
          }
        `);

        if (artworkResponse.errors) {
          throw new Error(artworkResponse.errors.map(e => e.message).join(', '));
        }

        artworkId = artworkResponse.data.createArtwork.document.id;
      }

      // Then create the track
      const response = await composeClient.executeQuery(`
        mutation {
          createTrack(input: {
            content: {
              title: "${title}"
              ipfsCid: "${ipfsCid}"
              ${artworkId ? `artwork: "${artworkId}"` : ''}
            }
          }) {
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
      `);

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