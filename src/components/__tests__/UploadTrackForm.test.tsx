import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UploadTrackForm } from '../UploadTrackForm';
import { encrypt } from '@nucypher/taco';
import { supabase } from '@/integrations/supabase/client';

// Mock the dependencies
vi.mock('@nucypher/taco', () => ({
  encrypt: vi.fn(),
  conditions: {
    condition: {
      erc721: {
        ERC721Balance: vi.fn()
      }
    }
  }
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null }))
    }))
  }
}));

describe('UploadTrackForm', () => {
  const mockWallet = {
    accounts: [{ address: '0x123' }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders in development mode', () => {
    render(<UploadTrackForm wallet={mockWallet} />);
    expect(screen.getByLabelText(/development mode/i)).toBeInTheDocument();
  });

  it('handles file upload and encryption', async () => {
    const mockFile = new File(['test audio'], 'test.mp3', { type: 'audio/mpeg' });
    const mockEncryptedData = new Uint8Array([1, 2, 3]);
    
    (encrypt as jest.Mock).mockResolvedValue(mockEncryptedData);
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: {
        audioCid: 'test-cid',
        coverArtCid: 'test-cover-cid'
      }
    });

    render(<UploadTrackForm wallet={mockWallet} />);

    const fileInput = screen.getByLabelText(/audio file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const submitButton = screen.getByRole('button', { name: /upload track/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(encrypt).toHaveBeenCalled();
      expect(supabase.functions.invoke).toHaveBeenCalled();
    });
  });

  it('shows error when wallet is not connected', async () => {
    render(<UploadTrackForm wallet={null} />);

    const submitButton = screen.getByRole('button', { name: /upload track/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please connect your wallet/i)).toBeInTheDocument();
  });
});