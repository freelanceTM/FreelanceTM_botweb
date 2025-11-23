export type Language = 'ru' | 'tm';

export const translations = {
  ru: {
    // Navigation
    home: 'Главная',
    categories: 'Категории',
    services: 'Услуги',
    myOrders: 'Мои заказы',
    myServices: 'Мои услуги',
    balance: 'Баланс',
    messages: 'Сообщения',
    profile: 'Профиль',
    admin: 'Админ-панель',
    login: 'Войти',
    logout: 'Выйти',
    becomeSeller: 'Стать продавцом',
    
    // Search
    searchServices: 'Найти услуги...',
    search: 'Поиск',
    filter: 'Фильтр',
    sortBy: 'Сортировать',
    priceRange: 'Диапазон цен',
    rating: 'Рейтинг',
    
    // Service card
    from: 'от',
    reviews: 'отзывов',
    orders: 'заказов',
    
    // Service details
    basic: 'Базовый',
    standard: 'Стандарт',
    premium: 'Премиум',
    orderNow: 'Заказать',
    viewProfile: 'Профиль продавца',
    portfolio: 'Портфолио',
    aboutService: 'О услуге',
    packages: 'Пакеты',
    description: 'Описание',
    
    // Order
    orderDetails: 'Детали заказа',
    requirements: 'Требования',
    delivery: 'Доставка',
    deliveryDays: 'дн.',
    submit: 'Отправить',
    cancel: 'Отменить',
    accept: 'Принять',
    requestRevision: 'На доработку',
    completeOrder: 'Завершить',
    orderStatus: 'Статус заказа',
    created: 'Создан',
    inProgress: 'В работе',
    revision: 'На доработке',
    completed: 'Выполнен',
    cancelled: 'Отменён',
    dispute: 'Спор',
    
    // Chat
    typeMessage: 'Введите сообщение...',
    send: 'Отправить',
    attachFile: 'Прикрепить файл',
    
    // Balance
    availableBalance: 'Доступно',
    pendingBalance: 'В ожидании',
    totalEarnings: 'Всего заработано',
    withdraw: 'Вывести',
    deposit: 'Пополнить',
    transactionHistory: 'История транзакций',
    withdrawalRequest: 'Запрос на вывод',
    amount: 'Сумма',
    paymentMethod: 'Способ оплаты',
    paymentDetails: 'Детали оплаты',
    
    // Reviews
    leaveReview: 'Оставить отзыв',
    yourRating: 'Ваша оценка',
    yourReview: 'Ваш отзыв',
    sellerResponse: 'Ответ продавца',
    
    // Profile
    editProfile: 'Редактировать',
    bio: 'О себе',
    responseTime: 'Время ответа',
    hours: 'ч.',
    completedOrders: 'Выполнено заказов',
    
    // Create service
    createService: 'Создать услугу',
    editService: 'Редактировать услугу',
    title: 'Название',
    category: 'Категория',
    price: 'Цена',
    days: 'дней',
    uploadImage: 'Загрузить изображение',
    save: 'Сохранить',
    
    // Admin
    users: 'Пользователи',
    allServices: 'Все услуги',
    allOrders: 'Все заказы',
    disputes: 'Споры',
    withdrawals: 'Выводы',
    settings: 'Настройки',
    commission: 'Комиссия',
    approve: 'Одобрить',
    reject: 'Отклонить',
    ban: 'Заблокировать',
    unban: 'Разблокировать',
    resolve: 'Решить',
    
    // Categories
    design: 'Дизайн',
    development: 'Разработка',
    marketing: 'Маркетинг',
    writing: 'Тексты',
    video: 'Видео',
    audio: 'Аудио',
    seo: 'SEO',
    smm: 'SMM',
    business: 'Бизнес',
    personal: 'Личные услуги',
    
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    noResults: 'Нет результатов',
    viewAll: 'Посмотреть все',
    back: 'Назад',
    next: 'Далее',
    delete: 'Удалить',
    edit: 'Редактировать',
    view: 'Просмотр',
    close: 'Закрыть',
    confirm: 'Подтвердить',
  },
  tm: {
    // Navigation
    home: 'Baş sahypa',
    categories: 'Kategoriýalar',
    services: 'Hyzmatlar',
    myOrders: 'Meniň sargytlarym',
    myServices: 'Meniň hyzmatlarym',
    balance: 'Balans',
    messages: 'Habarlar',
    profile: 'Profil',
    admin: 'Admin paneli',
    login: 'Girmek',
    logout: 'Çykmak',
    becomeSeller: 'Satyjy bolmak',
    
    // Search
    searchServices: 'Hyzmat gözle...',
    search: 'Gözleg',
    filter: 'Filtr',
    sortBy: 'Tertiplemek',
    priceRange: 'Baha aralygy',
    rating: 'Reýting',
    
    // Service card
    from: '-den',
    reviews: 'syn',
    orders: 'sargyt',
    
    // Service details
    basic: 'Esasy',
    standard: 'Standart',
    premium: 'Premium',
    orderNow: 'Sargyt etmek',
    viewProfile: 'Satyjynyň profili',
    portfolio: 'Portfolio',
    aboutService: 'Hyzmat hakynda',
    packages: 'Paketler',
    description: 'Düşündiriş',
    
    // Order
    orderDetails: 'Sargyt maglumatlary',
    requirements: 'Talaplar',
    delivery: 'Eltip bermek',
    deliveryDays: 'gün',
    submit: 'Ugratmak',
    cancel: 'Ýatyrmak',
    accept: 'Kabul etmek',
    requestRevision: 'Düzetmä',
    completeOrder: 'Tamamlamak',
    orderStatus: 'Sargyt ýagdaýy',
    created: 'Döredildi',
    inProgress: 'Işlenýär',
    revision: 'Düzedilýär',
    completed: 'Tamamlandy',
    cancelled: 'Ýatyryldy',
    dispute: 'Jedel',
    
    // Chat
    typeMessage: 'Habar ýazmak...',
    send: 'Ugratmak',
    attachFile: 'Faýl goşmak',
    
    // Balance
    availableBalance: 'Elýeterli',
    pendingBalance: 'Garaşylýar',
    totalEarnings: 'Umumy girdeji',
    withdraw: 'Çykarmak',
    deposit: 'Doldurmak',
    transactionHistory: 'Amallaryň taryhy',
    withdrawalRequest: 'Çykarmak haýyşy',
    amount: 'Mukdar',
    paymentMethod: 'Töleg usuly',
    paymentDetails: 'Töleg maglumatlary',
    
    // Reviews
    leaveReview: 'Syn galdyrmak',
    yourRating: 'Siziň bahalaňyz',
    yourReview: 'Siziň synyňyz',
    sellerResponse: 'Satyjynyň jogaby',
    
    // Profile
    editProfile: 'Redaktirlemek',
    bio: 'Öz hakynda',
    responseTime: 'Jogap wagty',
    hours: 'sagat',
    completedOrders: 'Tamamlanan sargytlar',
    
    // Create service
    createService: 'Hyzmat döretmek',
    editService: 'Hyzmaty redaktirlemek',
    title: 'Ady',
    category: 'Kategoriýa',
    price: 'Baha',
    days: 'gün',
    uploadImage: 'Surat ýüklemek',
    save: 'Saklamak',
    
    // Admin
    users: 'Ulanyjylar',
    allServices: 'Ähli hyzmatlar',
    allOrders: 'Ähli sargytlar',
    disputes: 'Jedeller',
    withdrawals: 'Çykarmalar',
    settings: 'Sazlamalar',
    commission: 'Komissiýa',
    approve: 'Tassyklamak',
    reject: 'Ret etmek',
    ban: 'Bloklamak',
    unban: 'Bloky açmak',
    resolve: 'Çözmek',
    
    // Categories
    design: 'Dizaýn',
    development: 'Programma',
    marketing: 'Marketing',
    writing: 'Tekstler',
    video: 'Wideo',
    audio: 'Audio',
    seo: 'SEO',
    smm: 'SMM',
    business: 'Biznes',
    personal: 'Şahsy hyzmatlar',
    
    // Common
    loading: 'Ýüklenýär...',
    error: 'Ýalňyşlyk',
    success: 'Üstünlik',
    noResults: 'Netije ýok',
    viewAll: 'Hemmesini görmek',
    back: 'Yza',
    next: 'Indiki',
    delete: 'Pozmak',
    edit: 'Redaktirlemek',
    view: 'Görmek',
    close: 'Ýapmak',
    confirm: 'Tassyklamak',
  },
};

export type TranslationKey = keyof typeof translations.ru;
