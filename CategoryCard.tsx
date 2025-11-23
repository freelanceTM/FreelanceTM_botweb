import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Category } from '@shared/schema';
import {
  Palette,
  Code,
  TrendingUp,
  FileText,
  Video,
  Music,
  Search,
  Share2,
  Briefcase,
  Heart,
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  design: Palette,
  development: Code,
  marketing: TrendingUp,
  writing: FileText,
  video: Video,
  audio: Music,
  seo: Search,
  smm: Share2,
  business: Briefcase,
  personal: Heart,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();
  const name = language === 'ru' ? category.nameRu : category.nameTm;
  const Icon = categoryIcons[category.slug] || Briefcase;

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3" data-testid={`card-category-${category.slug}`}>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-medium" data-testid={`text-category-name-${category.slug}`}>
          {name}
        </h3>
      </Card>
    </Link>
  );
}
