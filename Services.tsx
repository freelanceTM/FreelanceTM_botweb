import { useQuery } from '@tanstack/react-query';
import { useSearch } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { ServiceCard } from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service, User } from '@shared/schema';

export default function Services() {
  const { t } = useLanguage();
  const searchParams = new URLSearchParams(useSearch());
  const categoryId = searchParams.get('category');

  const { data: services, isLoading } = useQuery<(Service & { seller?: User })[]>({
    queryKey: ['/api/services', { categoryId }],
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('services')}</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
        <div className="text-center py-12 text-muted-foreground">
          {t('noResults')}
        </div>
      )}
    </div>
  );
}
