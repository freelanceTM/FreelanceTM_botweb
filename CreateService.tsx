import { useState } from 'react';
import { useNavigate } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Category } from '@shared/schema';

const serviceSchema = z.object({
  categoryId: z.string().min(1, 'Выберите категорию'),
  titleRu: z.string().min(1, 'Введите название на русском'),
  titleTm: z.string().min(1, 'Введите название на туркменском'),
  descriptionRu: z.string().min(1, 'Введите описание на русском'),
  descriptionTm: z.string().min(1, 'Введите описание на туркменском'),
  imageUrl: z.string().optional(),
  basicPrice: z.string().min(1, 'Введите цену'),
  basicDeliveryDays: z.string().min(1, 'Введите срок'),
  basicDescriptionRu: z.string().min(1, 'Введите описание пакета'),
  basicDescriptionTm: z.string().min(1, 'Введите описание пакета'),
  standardPrice: z.string().optional(),
  standardDeliveryDays: z.string().optional(),
  standardDescriptionRu: z.string().optional(),
  standardDescriptionTm: z.string().optional(),
  premiumPrice: z.string().optional(),
  premiumDeliveryDays: z.string().optional(),
  premiumDescriptionRu: z.string().optional(),
  premiumDescriptionTm: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function CreateService() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      titleRu: '',
      titleTm: '',
      descriptionRu: '',
      descriptionTm: '',
      basicPrice: '',
      basicDeliveryDays: '',
      basicDescriptionRu: '',
      basicDescriptionTm: '',
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      await apiRequest('POST', '/api/services', {
        ...data,
        basicPrice: Number(data.basicPrice),
        basicDeliveryDays: Number(data.basicDeliveryDays),
        standardPrice: data.standardPrice ? Number(data.standardPrice) : undefined,
        standardDeliveryDays: data.standardDeliveryDays ? Number(data.standardDeliveryDays) : undefined,
        premiumPrice: data.premiumPrice ? Number(data.premiumPrice) : undefined,
        premiumDeliveryDays: data.premiumDeliveryDays ? Number(data.premiumDeliveryDays) : undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: 'Услуга создана успешно',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      navigate('/my-services');
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

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  if (!user?.isSeller) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <Card>
          <CardContent className="pt-6">
            <p>Вы должны быть продавцом, чтобы создавать услуги</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('createService')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nameRu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titleRu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (RU)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-title-ru" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleTm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (TM)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-title-tm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="descriptionRu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание (RU)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} data-testid="textarea-description-ru" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionTm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание (TM)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} data-testid="textarea-description-tm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image URL */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения (опционально)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Packages */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">{t('basic')}</TabsTrigger>
                  <TabsTrigger value="standard">{t('standard')}</TabsTrigger>
                  <TabsTrigger value="premium">{t('premium')}</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basicPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-basic-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basicDeliveryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Срок (дней)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-basic-delivery" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basicDescriptionRu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание пакета (RU)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basicDescriptionTm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание пакета (TM)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="standard" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="standardPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="standardDeliveryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Срок (дней)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="standardDescriptionRu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание пакета (RU)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="standardDescriptionTm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание пакета (TM)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="premium" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="premiumPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="premiumDeliveryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Срок (дней)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="premiumDescriptionRu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание пакета (RU)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="premiumDescriptionTm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание пакета (TM)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createServiceMutation.isPending}
                data-testid="button-submit-service"
              >
                {createServiceMutation.isPending ? t('loading') : t('save')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
