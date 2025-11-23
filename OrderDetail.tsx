import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Order, Service, User } from '@shared/schema';
import { useState } from 'react';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const { data: order, isLoading } = useQuery<Order & { service?: Service; buyer?: User; seller?: User }>({
    queryKey: ['/api/orders', id],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest('PATCH', `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: t('success') });
      queryClient.invalidateQueries({ queryKey: ['/api/orders', id] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    },
  });

  const deliverOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/orders/${id}/deliver`, {
        deliveryUrl,
        deliveryNotes,
      });
    },
    onSuccess: () => {
      toast({ title: t('success'), description: 'Заказ доставлен' });
      queryClient.invalidateQueries({ queryKey: ['/api/orders', id] });
      setDeliveryUrl('');
      setDeliveryNotes('');
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        {t('noResults')}
      </div>
    );
  }

  const isSeller = user?.id === order.sellerId;
  const isBuyer = user?.id === order.buyerId;
  const otherUser = isBuyer ? order.seller : order.buyer;

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
    created: 'secondary',
    in_progress: 'default',
    revision: 'secondary',
    completed: 'default',
    cancelled: 'destructive',
    dispute: 'destructive',
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Заказ #{id.slice(0, 8)}</h1>
        <Badge variant={statusColors[order.status]} data-testid="badge-order-status">
          {t(order.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Service info */}
          <Card>
            <CardHeader>
              <CardTitle>Услуга</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{order.service?.titleRu}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Пакет: {order.packageType}</span>
                  <span>•</span>
                  <span>Цена: ${order.price}</span>
                  <span>•</span>
                  <span>Срок: {order.deliveryDays} дней</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {order.requirementsRu && (
            <Card>
              <CardHeader>
                <CardTitle>{t('requirements')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{order.requirementsRu}</p>
              </CardContent>
            </Card>
          )}

          {/* Delivery */}
          {order.status === 'in_progress' && isSeller && (
            <Card>
              <CardHeader>
                <CardTitle>Доставить заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Ссылка на результат
                  </label>
                  <Input
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    placeholder="https://..."
                    data-testid="input-delivery-url"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Примечания
                  </label>
                  <Textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={4}
                    data-testid="textarea-delivery-notes"
                  />
                </div>
                <Button
                  onClick={() => deliverOrderMutation.mutate()}
                  disabled={deliverOrderMutation.isPending || !deliveryUrl}
                  className="w-full"
                  data-testid="button-deliver-order"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {deliverOrderMutation.isPending ? t('loading') : 'Отправить результат'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delivered work */}
          {order.deliveryUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Результат работы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={order.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                  data-testid="link-delivery"
                >
                  <FileText className="h-4 w-4" />
                  Открыть результат
                </a>
                {order.deliveryNotes && (
                  <div>
                    <div className="text-sm font-medium mb-1">Примечания продавца:</div>
                    <p className="text-sm whitespace-pre-wrap">{order.deliveryNotes}</p>
                  </div>
                )}

                {isBuyer && order.status === 'in_progress' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => updateStatusMutation.mutate('completed')}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                      data-testid="button-accept-delivery"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('accept')}
                    </Button>
                    <Button
                      onClick={() => updateStatusMutation.mutate('revision')}
                      disabled={updateStatusMutation.isPending}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-request-revision"
                    >
                      {t('requestRevision')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Other user */}
          <Card>
            <CardHeader>
              <CardTitle>{isBuyer ? 'Продавец' : 'Покупатель'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={otherUser?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {otherUser?.firstName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {otherUser?.firstName} {otherUser?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {otherUser?.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Даты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <div className="text-muted-foreground">Создан</div>
                <div>{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              {order.dueDate && (
                <div>
                  <div className="text-muted-foreground">Срок выполнения</div>
                  <div>{new Date(order.dueDate).toLocaleString()}</div>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <div className="text-muted-foreground">Завершен</div>
                  <div>{new Date(order.completedAt).toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
