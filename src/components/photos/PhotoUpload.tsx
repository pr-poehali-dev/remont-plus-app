import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const PHOTOS_API_URL = 'https://functions.poehali.dev/a4dda58e-d940-416e-a8e8-7bd56869af62';

interface PhotoUploadProps {
  projectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PhotoUpload = ({ projectId, onSuccess, onCancel }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const roomPresets = [
    'Гостиная', 'Спальня', 'Кухня', 'Ванная',
    'Прихожая', 'Балкон', 'Кабинет', 'Детская'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      const base64Data = base64String.split(',')[1];
      setPhotoBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!photoBase64) {
      toast({
        title: 'Ошибка',
        description: 'Выберите фотографию',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(PHOTOS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          photo: photoBase64,
          room_name: roomName,
          description: description
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Готово!',
          description: 'Фотография успешно загружена'
        });
        onSuccess();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось загрузить фото',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Загрузка фотографии</h3>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreview(null);
                    setPhotoBase64('');
                  }}
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Помещение (необязательно)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {roomPresets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant={roomName === preset ? 'default' : 'outline'}
                      onClick={() => setRoomName(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Или введите название"
                />
              </div>

              <div className="space-y-2">
                <Label>Описание (необязательно)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Добавьте комментарий к фотографии..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full h-12"
              >
                {isUploading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={20} className="mr-2" />
                    Загрузить фото
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-6">
              <Button
                onClick={handleCameraCapture}
                className="w-full h-16 text-lg"
                variant="default"
              >
                <Icon name="Camera" size={24} className="mr-3" />
                Сделать фото
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                <Icon name="Image" size={24} className="mr-3" />
                Выбрать из галереи
              </Button>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Вы можете сделать фото камерой или выбрать из галереи</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" size={16} className="flex-shrink-0 mt-0.5 text-green-500" />
                  <span>Фотографии помогут дизайнерам и исполнителям</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Отмена
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};