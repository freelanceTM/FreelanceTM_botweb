import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, Shield, Clock } from 'lucide-react';

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {t('searchServices')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Найдите лучших фрилансеров для вашего проекта
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('searchServices')}
              className="w-full h-14 pl-12 pr-4 rounded-lg border bg-background text-lg"
              data-testid="input-hero-search"
            />
          </div>

          <div className="pt-4">
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="/api/login">{t('login')}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Проверенные профессионалы</h3>
              <p className="text-muted-foreground">
                Все продавцы проходят верификацию
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Безопасные сделки</h3>
              <p className="text-muted-foreground">
                Ваши деньги защищены до завершения работы
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Быстрое выполнение</h3>
              <p className="text-muted-foreground">
                Получите результат в срок или вернем деньги
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Готовы начать?
          </h2>
          <p className="text-xl text-muted-foreground">
            Присоединяйтесь к тысячам довольных клиентов и продавцов
          </p>
          <Button size="lg" asChild data-testid="button-cta-login">
            <a href="/api/login">{t('login')}</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
