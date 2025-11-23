import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { ServiceCard } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service } from '@shared/schema';

export default function MyServices() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services/my'],
  });

  if (!user?.isSeller) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>Вы должны быть продавцом, чтобы создавать услуги</p>
            <Button data-testid="button-become-seller">Стать продавцом</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('myServices')}</h1>
        <Button asChild data-testid="button-create-service">
          <Link href="/services/create">
            <Plus className="mr-2 h-4 w-4" />
            {t('createService')}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">У вас пока нет услуг</p>
            <Button asChild>
              <Link href="/services/create">
                <Plus className="mr-2 h-4 w-4" />
                Создать первую услугу
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
