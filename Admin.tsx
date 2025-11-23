import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Package, ShoppingCart, AlertCircle, DollarSign } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { User, Service, Order, Dispute, WithdrawalRequest } from '@shared/schema';
import { useState } from 'react';

export default function Admin() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [commissionRate, setCommissionRate] = useState('20');

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: services } = useQuery<(Service & { seller?: User })[]>({
    queryKey: ['/api/admin/services'],
  });

  const { data: orders } = useQuery<(Order & { buyer?: User; seller?: User })[]>({
    queryKey: ['/api/admin/orders'],
  });

  const { data: disputes } = useQuery<(Dispute & { order?: Order })[]>({
    queryKey: ['/api/admin/disputes'],
  });

  const { data: withdrawals } = useQuery<(WithdrawalRequest & { user?: User })[]>({
    queryKey: ['/api/admin/withdrawals'],
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('POST', `/api/admin/users/${userId}/ban`, {});
    },
    onSuccess: () => {
      toast({ title: t('success') });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      await apiRequest('POST', `/api/admin/withdrawals/${id}/${action}`, {});
    },
    onSuccess: () => {
      toast({ title: t('success') });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
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

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <Card>
          <CardContent className="pt-6">
            <p>Доступ запрещен</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">{t('admin')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground">Пользователи</div>
            </div>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground">Услуги</div>
            </div>
            <div className="text-2xl font-bold">{services?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground">Заказы</div>
            </div>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="text-sm text-muted-foreground">Споры</div>
            </div>
            <div className="text-2xl font-bold">{disputes?.filter(d => d.status === 'open').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t('users')}</TabsTrigger>
          <TabsTrigger value="services">{t('allServices')}</TabsTrigger>
          <TabsTrigger value="withdrawals">{t('withdrawals')}</TabsTrigger>
          <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Баланс</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>${u.balance}</TableCell>
                      <TableCell>
                        <Button
                          variant={u.isBanned ? 'default' : 'destructive'}
                          size="sm"
                          onClick={() => banUserMutation.mutate(u.id)}
                          data-testid={`button-ban-user-${u.id}`}
                        >
                          {u.isBanned ? t('unban') : t('ban')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Все услуги</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Продавец</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services?.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.titleRu}</TableCell>
                      <TableCell>
                        {s.seller?.firstName} {s.seller?.lastName}
                      </TableCell>
                      <TableCell>${s.basicPrice}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? 'default' : 'secondary'}>
                          {s.isActive ? 'Активна' : 'Неактивна'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Запросы на вывод</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Метод</TableHead>
                    <TableHead>Детали</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals?.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>
                        {w.user?.firstName} {w.user?.lastName}
                      </TableCell>
                      <TableCell className="font-medium">${w.amount}</TableCell>
                      <TableCell>{w.paymentMethod}</TableCell>
                      <TableCell className="max-w-xs truncate">{w.paymentDetails}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            w.status === 'approved'
                              ? 'default'
                              : w.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                processWithdrawalMutation.mutate({ id: w.id, action: 'approve' })
                              }
                              data-testid={`button-approve-withdrawal-${w.id}`}
                            >
                              {t('approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                processWithdrawalMutation.mutate({ id: w.id, action: 'reject' })
                              }
                              data-testid={`button-reject-withdrawal-${w.id}`}
                            >
                              {t('reject')}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки платформы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Комиссия сервиса (%)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="max-w-xs"
                    data-testid="input-commission-rate"
                  />
                  <Button data-testid="button-save-commission">Сохранить</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Текущая комиссия: {commissionRate}%
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
