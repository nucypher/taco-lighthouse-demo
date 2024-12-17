import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

interface UploadFormFieldsProps {
  devMode: boolean;
  setDevMode: (value: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  setAudioFile: (file: File | null) => void;
  setCoverArt: (file: File | null) => void;
}

export const UploadFormFields = ({
  devMode,
  setDevMode,
  title,
  setTitle,
  description,
  setDescription,
  setAudioFile,
  setCoverArt,
}: UploadFormFieldsProps) => {
  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="devMode"
          checked={devMode}
          onCheckedChange={setDevMode}
        />
        <Label htmlFor="devMode">Development Mode</Label>
      </div>

      {!devMode && (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">Track Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter track title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter track description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audioFile">Audio File</Label>
              <Input
                id="audioFile"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Supported: MP3, WAV, FLAC
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverArt">Cover Art</Label>
              <Input
                id="coverArt"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1400x1400px
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};