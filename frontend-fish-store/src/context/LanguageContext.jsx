import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ar: {
    // Brand
    store_name: 'أمير البحار',
    store_name_en: 'Prince of the Seas',
    store_full_title: 'أمير البحار — أسماك ومأكولات بحرية',
    store_tagline: 'مأكولات بحرية وأسماك طازجة يومياً بأعلى جودة',
    operations_console: 'إدارة متجر الأسماك',
    driver_portal: 'بوابة كابتن التوصيل',
    store_open: 'المتجر يستقبل الطلبات الآن',

    // Language
    language: 'اللغة',
    switch_lang_btn: 'English',
    lang_code: 'AR',

    // Navigation
    nav_dashboard: 'لوحة التحكم',
    nav_orders: 'طلبات الأسماك',
    nav_customers: 'العملاء',
    nav_drivers: 'كباتن التوصيل',
    nav_my_deliveries: 'طلباتي للتوصيل',
    main_menu: 'القائمة الرئيسية',
    sign_out: 'تسجيل الخروج',
    owner: 'المدير',
    driver: 'كابتن توصيل',

    // Topbar
    create_order: 'طلب أسماك جديد',
    search_placeholder: 'بحث سريع عن طلب أو عميل...',

    // Dashboard
    dashboard_title: 'نظرة عامة على المتجر',
    dashboard_subtitle: 'متابعة مباشرة لتجهيز وطهي وتوصيل طلبات أمير البحار',
    refresh: 'تحديث البيانات',
    total_orders: 'إجمالي طلبات اليوم',
    preparing_seafood: 'قيد التنظيف والتجهيز',
    out_for_delivery: 'في طريق التوصيل',
    delivered_orders: 'تم تسليمها للعميل',
    active_couriers: 'كباتن التوصيل المتاحين',
    total_customers: 'سجل العملاء',
    recent_orders: 'أحدث طلبات الأسماك',
    view_all_orders: 'عرض جميع الطلبات',
    no_recent_orders: 'لا توجد طلبات مسجلة بعد اليوم.',

    // Table headers & Order cards
    order_number: 'رقم الطلب',
    customer: 'العميل',
    phone: 'رقم الهاتف',
    address: 'العنوان',
    items_count: 'عدد الأصناف',
    items_list: 'الأصناف والتجهيز',
    total: 'الإجمالي',
    status: 'الحالة',
    driver_assigned: 'الكابتن المسؤول',
    unassigned: 'لم يُعين كابتن بعد',
    assign_driver: 'تعيين كابتن',
    time: 'الوقت',
    actions: 'الإجراءات',
    view_details: 'التفاصيل',

    // Statuses
    status_preparing: 'قيد التجهيز والطهي',
    status_out_for_delivery: 'في الطريق للتوصيل',
    status_delivered: 'تم التسليم بنجاح',

    // Orders page
    orders_title: 'إدارة طلبات الأسماك والمأكولات البحرية',
    orders_subtitle: 'فلترة ومتابعة كل وجبات وطلبات التوصيل',
    filter_all: 'الكل',
    filter_preparing: 'قيد التجهيز',
    filter_out_for_delivery: 'في الطريق',
    filter_delivered: 'تم التسليم',
    search_orders_placeholder: 'ابحث برقم الطلب، اسم العميل، الهاتف أو الصنف...',
    no_orders_found: 'لم يتم العثور على أي طلبات مطابقة.',

    // Create Order Modal
    new_order_title: 'طلب أسماك جديد — أمير البحار',
    new_order_desc: 'اختر عميلاً مسجلاً أو أدخل عميلاً جديداً وحدد الأسماك والمأكولات البحرية المطلوبة.',
    existing_customer: 'عميل مسجل سابقاً',
    new_customer: 'عميل جديد',
    select_customer: 'اختر العميل',
    select_customer_placeholder: 'ابحث باسم العميل أو رقمه...',
    customer_name: 'اسم العميل',
    customer_phone: 'رقم الهاتف (واتساب / اتصال)',
    delivery_address_opt: 'عنوان التوصيل (المنطقة / الشارع / العمارة)',
    order_notes: 'ملاحظات خاصة بالتسوية أو التوصيل (مثل: مشوي ردة، بهارات زيادة...)',
    quick_menu_title: 'أشهر أصناف أمير البحار (انقر للإضافة السريعة):',
    cat_fresh_fish: '🐟 أسماك طازجة',
    cat_seafood: '🦐 جمبري وفواكه بحر',
    cat_meals: '🍲 طواجن ووجبات جاهزة',
    cat_cooking: '🔥 طرق التسوية والتجهيز',
    order_items: 'أصناف الطلب',
    item_placeholder: 'مثال: 2 كجم سمك بلطي مشوي ردة',
    quantity: 'الكمية',
    price_egp: 'السعر (ج.م)',
    add_another_item: 'إضافة صنف آخر',
    calculated_total: 'الإجمالي المقدر',
    submit_create_order: 'تأكيد وحفظ طلب الأسماك',
    cancel: 'إلغاء',

    // Customers page
    customers_title: 'سجل عملاء أمير البحار',
    customers_subtitle: 'إدارة بيانات العملاء وعناوين التوصيل وسجل طلباتهم',
    add_customer: 'إضافة عميل جديد',
    import_contacts: 'استيراد من جهات الاتصال',
    search_customers_placeholder: 'بحث بالاسم أو رقم الهاتف أو العنوان...',
    total_orders_placed: 'إجمالي الطلبات',
    last_order: 'آخر طلب',
    no_customers_found: 'لا يوجد عملاء مطابقين للبحث.',

    // Drivers page
    drivers_title: 'كباتن توصيل أمير البحار',
    drivers_subtitle: 'متابعة أداء مناديب التوصيل وحالتهم الحالية',
    add_driver: 'إضافة كابتن توصيل',
    driver_status_active: 'متاح للطلبات',
    driver_status_inactive: 'غير متاح',
    completed_deliveries: 'طلبات مكتملة',
    active_deliveries: 'طلبات جارية',

    // Login page
    login_heading: 'أمير البحار',
    login_subheading: 'منظومة إدارة وتوصيل المأكولات البحرية والأسماك',
    phone_label: 'رقم الهاتف',
    password_label: 'كلمة المرور',
    sign_in_button: 'تسجيل الدخول للمتجر',
    demo_accounts_title: 'حسابات تجريبية سريعة بنقرة واحدة',
    demo_owner: 'حساب الإدارة (المالك)',
    demo_driver: 'حساب كابتن التوصيل',

    // Units
    currency: 'ج.م',
    kg: 'كجم',
  },

  en: {
    // Brand
    store_name: 'Prince of the Seas',
    store_name_en: 'Prince of the Seas',
    store_full_title: 'Prince of the Seas — Fresh Seafood & Fish',
    store_tagline: 'Premium Fresh Seafood & Ocean Catch Delivered Daily',
    operations_console: 'Fish Store Console',
    driver_portal: 'Courier Delivery Portal',
    store_open: 'Store Open for Orders Now',

    // Language
    language: 'Language',
    switch_lang_btn: 'العربية',
    lang_code: 'EN',

    // Navigation
    nav_dashboard: 'Dashboard',
    nav_orders: 'Seafood Orders',
    nav_customers: 'Customers',
    nav_drivers: 'Delivery Couriers',
    nav_my_deliveries: 'My Deliveries',
    main_menu: 'Main Menu',
    sign_out: 'Sign Out',
    owner: 'Owner',
    driver: 'Courier',

    // Topbar
    create_order: 'New Seafood Order',
    search_placeholder: 'Quick search orders or customers...',

    // Dashboard
    dashboard_title: 'Store Operations Overview',
    dashboard_subtitle: 'Real-time tracking of fresh fish prep, cooking, and delivery orders',
    refresh: 'Refresh Data',
    total_orders: "Today's Orders",
    preparing_seafood: 'Kitchen Prep & Cleaning',
    out_for_delivery: 'Out for Delivery',
    delivered_orders: 'Delivered to Customer',
    active_couriers: 'Active Couriers',
    total_customers: 'Registered Customers',
    recent_orders: 'Recent Seafood Orders',
    view_all_orders: 'View All Orders',
    no_recent_orders: 'No orders recorded yet today.',

    // Table headers & Order cards
    order_number: 'Order #',
    customer: 'Customer',
    phone: 'Phone',
    address: 'Address',
    items_count: 'Items Count',
    items_list: 'Items & Cooking Style',
    total: 'Total',
    status: 'Status',
    driver_assigned: 'Assigned Courier',
    unassigned: 'Unassigned',
    assign_driver: 'Assign Courier',
    time: 'Time',
    actions: 'Actions',
    view_details: 'Details',

    // Statuses
    status_preparing: 'Preparing & Cooking',
    status_out_for_delivery: 'Out for Delivery',
    status_delivered: 'Delivered',

    // Orders page
    orders_title: 'Seafood Orders Management',
    orders_subtitle: 'Filter and manage all fish meals and deliveries',
    filter_all: 'All',
    filter_preparing: 'Preparing',
    filter_out_for_delivery: 'Out for Delivery',
    filter_delivered: 'Delivered',
    search_orders_placeholder: 'Search by order #, customer, phone or fish type...',
    no_orders_found: 'No matching orders found.',

    // Create Order Modal
    new_order_title: 'New Seafood Order — Prince of the Seas',
    new_order_desc: 'Select an existing customer or enter a new customer, then choose seafood and cooking styles.',
    existing_customer: 'Existing Customer',
    new_customer: 'New Customer',
    select_customer: 'Select Customer',
    select_customer_placeholder: 'Search customer name or phone...',
    customer_name: 'Customer Name',
    customer_phone: 'Phone Number',
    delivery_address_opt: 'Delivery Address (Area / Street / Building)',
    order_notes: 'Preparation or Delivery Notes (e.g. extra spicy, grilled with bran...)',
    quick_menu_title: 'Prince of the Seas Signature Catch (Click to add):',
    cat_fresh_fish: '🐟 Fresh Fish',
    cat_seafood: '🦐 Shrimp & Shellfish',
    cat_meals: '🍲 Meals & Casseroles',
    cat_cooking: '🔥 Cooking Styles',
    order_items: 'Order Items',
    item_placeholder: 'e.g. 2 kg Fresh Tilapia grilled with bran',
    quantity: 'Quantity',
    price_egp: 'Price (EGP)',
    add_another_item: 'Add Another Item',
    calculated_total: 'Estimated Total',
    submit_create_order: 'Confirm & Place Seafood Order',
    cancel: 'Cancel',

    // Customers page
    customers_title: 'Prince of the Seas Customers',
    customers_subtitle: 'Manage client directory, delivery addresses and order history',
    add_customer: 'Add Customer',
    import_contacts: 'Import Contacts',
    search_customers_placeholder: 'Search by name, phone or address...',
    total_orders_placed: 'Total Orders',
    last_order: 'Last Order',
    no_customers_found: 'No customers match your search.',

    // Drivers page
    drivers_title: 'Delivery Couriers',
    drivers_subtitle: 'Track courier status and delivery distribution',
    add_driver: 'Add Courier',
    driver_status_active: 'Available',
    driver_status_inactive: 'Inactive',
    completed_deliveries: 'Completed',
    active_deliveries: 'In Transit',

    // Login page
    login_heading: 'Prince of the Seas',
    login_subheading: 'Seafood Store Delivery & Operations Management',
    phone_label: 'Phone Number',
    password_label: 'Password',
    sign_in_button: 'Sign In to Console',
    demo_accounts_title: 'Quick 1-Click Demo Accounts',
    demo_owner: 'Store Owner (Admin)',
    demo_driver: 'Courier Account',

    // Units
    currency: 'EGP',
    kg: 'kg',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('prince_lang') || 'ar';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('prince_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    if (isRTL) {
      document.body.classList.remove('font-outfit');
      document.body.classList.add('font-cairo');
    } else {
      document.body.classList.remove('font-cairo');
      document.body.classList.add('font-outfit');
    }
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLanguage = (lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.ar;
    return dict[key] !== undefined ? dict[key] : (fallback || key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL,
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
