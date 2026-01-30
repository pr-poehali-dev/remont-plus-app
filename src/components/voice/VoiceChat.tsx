import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const YASEN_API_URL = 'https://functions.poehali.dev/f540d647-f4c0-4217-84af-9f25ac6a842d';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VoiceChatProps {
  userRole?: 'customer' | 'contractor';
  conversationId?: string;
}

export const VoiceChat = ({ userRole = 'customer', conversationId }: VoiceChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      toast({
        title: 'Запись начата',
        description: 'Говорите с ЯСЕН',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось начать запись. Проверьте доступ к микрофону.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const transcribeResponse = await fetch(`${YASEN_API_URL}?action=transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio }),
        });
        
        const transcribeData = await transcribeResponse.json();
        
        if (!transcribeData.success) {
          throw new Error('Transcription failed');
        }
        
        const userMessage = transcribeData.text;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        
        const chatResponse = await fetch(`${YASEN_API_URL}?action=chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history: messages,
            user_role: userRole,
          }),
        });
        
        const chatData = await chatResponse.json();
        
        if (!chatData.success) {
          throw new Error('Chat failed');
        }
        
        const assistantMessage = chatData.message;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        
        await speakText(assistantMessage);
      };
    } catch (error) {
      console.error('Failed to process audio:', error);
      toast({
        title: 'Ошибка обработки',
        description: 'Не удалось обработать запись. Попробуйте еще раз.',
        variant: 'destructive',
      });
    }
    
    setIsProcessing(false);
  };

  const speakText = async (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: 'Разговор очищен',
      description: 'История сообщений удалена',
    });
  };

  return (
    <Card className="shadow-2xl border-0 max-w-2xl mx-auto">
      <CardHeader className="gradient-purple-pink text-white">
        <CardTitle className="flex items-center gap-3">
          <Icon name="Bot" size={28} />
          <div>
            <h3 className="text-xl font-bold">ЯСЕН — Голосовой помощник</h3>
            <p className="text-sm text-white/90 font-normal">
              {userRole === 'customer' ? 'Режим: Заказчик' : 'Режим: Исполнитель'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Mic" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Нажмите на микрофон и начните разговор с ЯСЕН</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-white ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    name={msg.role === 'user' ? 'User' : 'Bot'}
                    size={20}
                    className={msg.role === 'user' ? 'text-white' : 'text-primary'}
                  />
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3 justify-center pt-4 border-t">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing || isSpeaking}
              size="lg"
              className="gradient-purple-pink text-white border-0 h-20 w-20 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              <Icon name="Mic" size={32} />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="h-20 w-20 rounded-full shadow-xl animate-pulse"
            >
              <Icon name="Square" size={32} />
            </Button>
          )}
          
          {messages.length > 0 && (
            <Button
              onClick={clearConversation}
              variant="outline"
              size="lg"
              className="h-20 w-20 rounded-full"
              disabled={isRecording || isProcessing}
            >
              <Icon name="Trash2" size={24} />
            </Button>
          )}
        </div>

        {(isProcessing || isSpeaking) && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin">
                <Icon name="Loader2" size={16} />
              </div>
              {isProcessing ? 'Обработка...' : 'ЯСЕН отвечает...'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
