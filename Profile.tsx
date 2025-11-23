import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile header */}
      <Card>
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user.firstName?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" data-testid="text-profile-name">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {user.role === 'admin' && (
                  <Badge variant="destructive">Admin</Badge>
                )}
                {user.isSeller && (
                  <Badge>Продавец</Badge>
                )}
                {user.isVerified && (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Проверен
                  </Badge>
                )}
              </div>
            </div>
            <Button data-testid="button-edit-profile">{t('editProfile')}</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{user.completedOrders}</div>
              <div className="text-sm text-muted-foreground">{t('completedOrders')}</div>
            </div>
            {user.rating && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  {Number(user.rating).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.reviewCount} {t('reviews')}
                </div>
              </div>
            )}
            {user.responseTime && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Clock className="h-6 w-6" />
                  {user.responseTime}{t('hours')}
                </div>
                <div className="text-sm text-muted-foreground">{t('responseTime')}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {user.bio && (
        <Card>
          <CardHeader>
            <CardTitle>{t('bio')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{user.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
