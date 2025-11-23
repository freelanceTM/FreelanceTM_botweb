import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Clock, CheckCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Service, User, Review } from '@shared/schema';
import { useState } from 'react';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  const { data: service, isLoading } = useQuery<Service & { seller?: User }>({
    queryKey: ['/api/services', id],
  });

  const { data: reviews } = useQuery<(Review & { buyer?: User })[]>({
    queryKey: ['/api/services', id, 'reviews'],
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/orders', {
        serviceId: id,
        packageType: selectedPackage,
      });
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: 'Заказ создан успешно',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      window.location.href = '/orders';
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!service) {
    return <div className="text-center py-12">{t('noResults')}</div>;
  }

  const title = language === 'ru' ? service.titleRu : service.titleTm;
  const description = language === 'ru' ? service.descriptionRu : service.descriptionTm;

  const packages = [
    {
      type: 'basic' as const,
      name: t('basic'),
      price: service.basicPrice,
      deliveryDays: service.basicDeliveryDays,
      description: language === 'ru' ? service.basicDescriptionRu : service.basicDescriptionTm,
    },
    service.standardPrice ? {
      type: 'standard' as const,
      name: t('standard'),
      price: service.standardPrice,
      deliveryDays: service.standardDeliveryDays!,
      description: language === 'ru' ? service.standardDescriptionRu! : service.standardDescriptionTm!,
    } : null,
    service.premiumPrice ? {
      type: 'premium' as const,
      name: t('premium'),
      price: service.premiumPrice,
      deliveryDays: service.premiumDeliveryDays!,
      description: language === 'ru' ? service.premiumDescriptionRu! : service.premiumDescriptionTm!,
    } : null,
  ].filter(Boolean);

  const selectedPkg = packages.find(p => p?.type === selectedPackage);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
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
          </div>

          {/* Service info */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold" data-testid="text-service-title">{title}</h1>

            {/* Seller info */}
            {service.seller && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={service.seller.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {service.seller.firstName?.[0] || service.seller.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/users/${service.sellerId}`}>
                    <a className="font-medium hover:underline">
                      {service.seller.firstName} {service.seller.lastName}
                    </a>
                  </Link>
                  {service.seller.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{Number(service.seller.rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({service.seller.reviewCount})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">{t('description')}</TabsTrigger>
                <TabsTrigger value="reviews">{t('reviews')} ({service.reviewCount})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="prose max-w-none">
                <div className="whitespace-pre-wrap">{description}</div>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.buyer?.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {review.buyer?.firstName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {review.buyer?.firstName} {review.buyer?.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                        {review.sellerResponse && (
                          <div className="ml-8 mt-2 p-3 bg-muted rounded-md">
                            <div className="text-xs font-medium mb-1">{t('sellerResponse')}</div>
                            <p className="text-sm">{review.sellerResponse}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('noResults')}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Order sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>{t('packages')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Package selector */}
              <div className="space-y-2">
                {packages.map((pkg) => pkg && (
                  <button
                    key={pkg.type}
                    onClick={() => setSelectedPackage(pkg.type)}
                    className={`w-full p-4 rounded-lg border-2 text-left hover-elevate active-elevate-2 transition-colors ${
                      selectedPackage === pkg.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    data-testid={`button-package-${pkg.type}`}
                  >
                    <div className="font-medium mb-1">{pkg.name}</div>
                    <div className="text-2xl font-bold mb-2">${pkg.price}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {pkg.deliveryDays} {t('days')}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected package details */}
              {selectedPkg && (
                <div className="space-y-3 pt-2">
                  <div className="text-sm whitespace-pre-wrap">{selectedPkg.description}</div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    <span>{selectedPkg.deliveryDays} {t('days')} {t('delivery')}</span>
                  </div>
                </div>
              )}

              {/* Order button */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending || !isAuthenticated}
                data-testid="button-create-order"
              >
                {createOrderMutation.isPending ? t('loading') : t('orderNow')}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  <a href="/api/login" className="underline">
                    {t('login')}
                  </a>{' '}
                  чтобы заказать
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
