import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Clock, Download } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Transaction, WithdrawalRequest } from '@shared/schema';

export default function Balance() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: withdrawalRequests } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/withdrawal-requests'],
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/withdrawal-requests', {
        amount: Number(withdrawAmount),
        paymentMethod,
        paymentDetails,
      });
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: 'Запрос на вывод отправлен',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setPaymentMethod('');
      setPaymentDetails('');
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
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('balance')}</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">{t('availableBalance')}</div>
            </div>
            <div className="text-3xl font-bold" data-testid="text-available-balance">
              ${user?.balance || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-sm text-muted-foreground">{t('pendingBalance')}</div>
            </div>
            <div className="text-3xl font-bold" data-testid="text-pending-balance">
              ${user?.pendingBalance || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-sm text-muted-foreground">{t('totalEarnings')}</div>
            </div>
            <div className="text-3xl font-bold" data-testid="text-total-earnings">
              ${user?.totalEarnings || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw button */}
      {user?.isSeller && (
        <div className="mb-6">
          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-withdraw">
                <Download className="mr-2 h-4 w-4" />
                {t('withdraw')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('withdrawalRequest')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('amount')}</label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-withdraw-amount"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Доступно: ${user?.balance || '0.00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('paymentMethod')}</label>
                  <Input
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Карта, PayPal, и т.д."
                    data-testid="input-payment-method"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('paymentDetails')}</label>
                  <Textarea
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Номер карты, email PayPal, и т.д."
                    data-testid="textarea-payment-details"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => withdrawMutation.mutate()}
                  disabled={withdrawMutation.isPending || !withdrawAmount || !paymentMethod || !paymentDetails}
                  data-testid="button-submit-withdrawal"
                >
                  {withdrawMutation.isPending ? t('loading') : t('submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Withdrawal requests */}
      {withdrawalRequests && withdrawalRequests.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Запросы на вывод</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawalRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">${req.amount}</div>
                    <div className="text-sm text-muted-foreground">{req.paymentMethod}</div>
                  </div>
                  <Badge
                    variant={
                      req.status === 'approved'
                        ? 'default'
                        : req.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                    data-testid={`badge-withdrawal-${req.id}`}
                  >
                    {req.status === 'pending' ? 'В обработке' : req.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactionHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="text-right">Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge variant="secondary">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {language === 'ru' ? transaction.descriptionRu : transaction.descriptionTm}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          ['deposit', 'earnings', 'refund'].includes(transaction.type)
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {['deposit', 'earnings', 'refund'].includes(transaction.type) ? '+' : '-'}
                        ${transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('noResults')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
