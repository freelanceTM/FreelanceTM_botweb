import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Order, Message, User } from '@shared/schema';

export default function Messages() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<(Message & { sender?: User })[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: orders } = useQuery<(Order & { buyer?: User; seller?: User })[]>({
    queryKey: ['/api/orders/conversations'],
  });

  const { data: initialMessages } = useQuery<(Message & { sender?: User })[]>({
    queryKey: ['/api/orders', selectedOrder, 'messages'],
    enabled: !!selectedOrder,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // WebSocket connection
  useEffect(() => {
    if (!selectedOrder) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', orderId: selectedOrder }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message' && data.orderId === selectedOrder) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [selectedOrder]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !wsRef.current || !selectedOrder) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'sendMessage',
        orderId: selectedOrder,
        content: messageText,
      })
    );

    setMessageText('');
  };

  const selectedOrderData = orders?.find((o) => o.id === selectedOrder);
  const otherUser = selectedOrderData
    ? selectedOrderData.buyerId === user?.id
      ? selectedOrderData.seller
      : selectedOrderData.buyer
    : null;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('messages')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Conversations list */}
        <Card className="lg:col-span-1">
          <CardHeader className="font-semibold">Чаты</CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {orders?.map((order) => {
                const other = order.buyerId === user?.id ? order.seller : order.buyer;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order.id)}
                    className={`w-full p-4 flex items-center gap-3 hover-elevate active-elevate-2 border-b ${
                      selectedOrder === order.id ? 'bg-muted' : ''
                    }`}
                    data-testid={`button-conversation-${order.id}`}
                  >
                    <Avatar>
                      <AvatarImage src={other?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {other?.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="font-medium truncate">
                        {other?.firstName} {other?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        Заказ #{order.id.slice(0, 8)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="lg:col-span-2">
          {selectedOrder ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={otherUser?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {otherUser?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {otherUser?.firstName} {otherUser?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Заказ #{selectedOrder.slice(0, 8)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-24rem)] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                          data-testid={`message-${message.id}`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.fileUrl && (
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline mt-1 block"
                            >
                              {message.fileName}
                            </a>
                          )}
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" data-testid="button-attach-file">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={t('typeMessage')}
                      data-testid="input-message"
                    />
                    <Button onClick={sendMessage} data-testid="button-send-message">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Выберите чат</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
