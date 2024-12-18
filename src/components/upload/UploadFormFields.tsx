import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface UploadFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  setAudioFile: (file: File | null) => void;
  setCoverArt: (file: File | null) => void;
}

export const UploadFormFields = ({
  title,
  setTitle,
  setAudioFile,
  setCoverArt,
}: UploadFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="audio">Audio File</Label>
        <Input
          id="audio"
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover">Cover Art (optional)</Label>
        <Input
          id="cover"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
        />
      </div>
    </>
  );
};