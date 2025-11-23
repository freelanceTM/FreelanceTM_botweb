import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Service, User } from '@shared/schema';

interface ServiceCardProps {
  service: Service & { seller?: User };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { t, language } = useLanguage();
  
  const title = language === 'ru' ? service.titleRu : service.titleTm;
  const sellerName = service.seller
    ? `${service.seller.firstName || ''} ${service.seller.lastName || ''}`.trim() || service.seller.email
    : 'Unknown';

  return (
    <Link href={`/services/${service.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-service-${service.id}`}>
        {/* Image */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {title}
            </div>
          )}
          
          {/* Seller avatar overlay */}
          <div className="absolute bottom-2 left-2">
            <Avatar className="w-10 h-10 border-2 border-background">
              <AvatarImage src={service.seller?.profileImageUrl || undefined} />
              <AvatarFallback className="text-xs">
                {sellerName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-lg line-clamp-2 min-h-[3.5rem]" data-testid={`text-service-title-${service.id}`}>
            {title}
          </h3>

          {/* Rating and reviews */}
          {service.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{Number(service.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({service.reviewCount})</span>
            </div>
          )}

          {/* Price and delivery */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{t('from')}</div>
              <div className="text-xl font-semibold" data-testid={`text-service-price-${service.id}`}>
                ${service.basicPrice}
              </div>
            </div>
            <Badge variant="secondary">
              {service.basicDeliveryDays} {t('deliveryDays')}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
