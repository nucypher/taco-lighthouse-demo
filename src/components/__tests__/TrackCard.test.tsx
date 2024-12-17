import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TrackCard } from '../TrackCard';
import { decrypt } from '@nucypher/taco';

// Mock the dependencies
vi.mock('@nucypher/taco', () => ({
  decrypt: vi.fn(),
  conditions: {
    condition: {
      erc721: {
        ERC721Balance: vi.fn()
      }
    }
  }
}));

vi.mock('@/App', () => ({
  useAudioPlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    playTrack: vi.fn(),
    togglePlayPause: vi.fn(),
  })
}));

describe('TrackCard', () => {
  const mockProps = {
    title: 'Test Track',
    artist: '0x123...456',
    coverUrl: 'test-cover.jpg',
    trackId: '1',
    ipfsCid: 'test-cid',
    decryptionConditions: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn();
  });

  it('renders track information correctly', () => {
    render(<TrackCard {...mockProps} />);
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('0x123...456')).toBeInTheDocument();
  });

  it('handles decryption and playback', async () => {
    const mockDecryptedData = new Uint8Array([1, 2, 3]);
    (decrypt as jest.Mock).mockResolvedValue(mockDecryptedData);
    (global.fetch as jest.Mock).mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(3))
    });

    render(<TrackCard {...mockProps} />);

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(decrypt).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('shows error when decryption fails', async () => {
    (decrypt as jest.Mock).mockRejectedValue(new Error('Decryption failed'));
    (global.fetch as jest.Mock).mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(3))
    });

    render(<TrackCard {...mockProps} />);

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });
});