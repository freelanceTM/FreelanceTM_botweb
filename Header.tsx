import { Link } from 'wouter';
import { Search, User, ShoppingBag, MessageSquare, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/">
            <a className="text-2xl font-semibold text-primary hover-elevate active-elevate-2 px-3 py-2 rounded-md" data-testid="link-home">
              FreelanceHub
            </a>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchServices')}
                className="w-full pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <LanguageToggle />

            {isLoading ? null : isAuthenticated && user ? (
              <>
                <Button variant="ghost" size="icon" asChild data-testid="button-messages">
                  <Link href="/messages">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild data-testid="button-orders">
                  <Link href="/orders">
                    <ShoppingBag className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild data-testid="button-balance">
                  <Link href="/balance">
                    <Wallet className="h-5 w-5" />
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-profile-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        {t('profile')}
                      </Link>
                    </DropdownMenuItem>
                    {user.isSeller && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-services">
                          {t('myServices')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          {t('admin')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" data-testid="link-logout">
                        {t('logout')}
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild data-testid="button-login">
                <a href="/api/login">{t('login')}</a>
              </Button>
            )}
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchServices')}
              className="w-full pl-10"
              data-testid="input-search-mobile"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
