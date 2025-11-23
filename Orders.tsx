import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, Service, User } from '@shared/schema';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  created: 'secondary',
  in_progress: 'default',
  revision: 'secondary',
  completed: 'default',
  cancelled: 'destructive',
  dispute: 'destructive',
};

export default function Orders() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: buyerOrders, isLoading: buyerLoading } = useQuery<(Order & { service?: Service; seller?: User })[]>({
    queryKey: ['/api/orders/buyer'],
  });

  const { data: sellerOrders, isLoading: sellerLoading } = useQuery<(Order & { service?: Service; buyer?: User })[]>({
    queryKey: ['/api/orders/seller'],
  });

  const renderOrderCard = (order: Order & { service?: Service; seller?: User; buyer?: User }) => {
    const otherUser = order.seller || order.buyer;
    
    return (
      <Card key={order.id} className="hover-elevate active-elevate-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {order.service?.titleRu || 'Service'}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {otherUser?.firstName} {otherUser?.lastName}
              </div>
            </div>
            <Badge variant={statusColors[order.status] || 'default'} data-testid={`badge-order-status-${order.id}`}>
              {t(order.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Цена</div>
              <div className="text-xl font-semibold">${order.price}</div>
            </div>
            <Button asChild data-testid={`button-view-order-${order.id}`}>
              <Link href={`/orders/${order.id}`}>
                {t('view')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('myOrders')}</h1>

      <Tabs defaultValue="buyer">
        <TabsList>
          <TabsTrigger value="buyer">Как покупатель</TabsTrigger>
          {user?.isSeller && (
            <TabsTrigger value="seller">Как продавец</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="buyer" className="space-y-4">
          {buyerLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))
          ) : buyerOrders && buyerOrders.length > 0 ? (
            buyerOrders.map(renderOrderCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {t('noResults')}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {user?.isSeller && (
          <TabsContent value="seller" className="space-y-4">
            {sellerLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))
            ) : sellerOrders && sellerOrders.length > 0 ? (
              sellerOrders.map(renderOrderCard)
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {t('noResults')}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
