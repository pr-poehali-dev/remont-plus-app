import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Здравствуйте! Я ваш ИИ-консультант по ремонту. Расскажите о вашей квартире и планах на ремонт, и я помогу создать идеальный проект!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "Какой стиль выбрать для спальни?",
    "Сколько стоит ремонт кухни?",
    "Какие материалы лучше для ванной?",
    "Как сэкономить на ремонте?"
  ];

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Отличный вопрос! Для спальни рекомендую спокойные пастельные тона и натуральные материалы. Могу показать несколько вариантов дизайна и рассчитать примерную стоимость. Хотите увидеть визуализацию?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">ИИ-консультант</h1>
                <p className="text-sm text-gray-600">Онлайн</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/designer')}>
                <Icon name="Palette" className="mr-2 h-4 w-4" />
                Создать проект
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                <Icon name="LayoutDashboard" className="mr-2 h-4 w-4" />
                Мои проекты
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-220px)] flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === "assistant"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        <Icon 
                          name={message.role === "assistant" ? "Bot" : "User"} 
                          className="h-5 w-5"
                        />
                      </div>
                      <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                        <div className={`inline-block rounded-lg p-4 ${
                          message.role === "assistant"
                            ? "bg-white border"
                            : "bg-purple-600 text-white"
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Icon name="Bot" className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Напишите ваш вопрос..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                    <Icon name="Send" className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="MessageSquare" className="h-5 w-5 text-purple-600" />
                Быстрые вопросы
              </h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleSendMessage(question)}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <Icon name="Sparkles" className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Готовы создать проект?</h3>
              <p className="text-sm text-gray-600 mb-4">
                На основе нашего разговора я могу сгенерировать дизайн-проект и смету
              </p>
              <Button className="w-full" onClick={() => navigate('/designer')}>
                Создать проект
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Upload" className="h-5 w-5 text-purple-600" />
                Загрузить фото
              </h3>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Icon name="Image" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Загрузите фото помещения</p>
                <p className="text-xs text-gray-500">для персональных рекомендаций</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
