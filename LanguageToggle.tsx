import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('ru')}
        className={`min-h-8 px-3 ${language === 'ru' ? 'bg-background' : ''}`}
        data-testid="button-language-ru"
      >
        RU
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('tm')}
        className={`min-h-8 px-3 ${language === 'tm' ? 'bg-background' : ''}`}
        data-testid="button-language-tm"
      >
        TM
      </Button>
    </div>
  );
}
