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
    cat_fresh_fish: 'أسماك طازجة',
    cat_seafood: 'جمبري وفواكه بحر',
    cat_meals: 'طواجن ووجبات جاهزة',
    cat_cooking: 'طرق التسوية والتجهيز',
    order_items: 'أصناف الطلب',
    item_placeholder: 'مثال: 2 كجم سمك بلطي مشوي ردة',
    quantity: 'الكمية',
    price_egp: 'السعر (ج.م)',
    add_another_item: 'إضافة صنف آخر',
    calculated_total: 'الإجمالي المقدر',
    submit_create_order: 'تأكيد وحفظ طلب الأسماك',
    cancel: 'إلغاء',
    edit_order: 'تعديل الطلب',
    edit_order_title: 'تعديل طلب الأسماك #',
    edit_order_desc: 'تعديل الأصناف، الكابتن، العنوان أو حالة الطلب.',
    save_changes: 'حفظ التعديلات',
    order_status_label: 'حالة الطلب',
    mark_out_for_delivery: 'بدء التوصيل (في الطريق)',
    mark_delivered: 'تأكيد تسليم الطلب',
    revert_to_preparing: 'إعادة لقيد التجهيز',
    delete_order: 'حذف الطلب',
    delete_order_title: 'حذف طلب الأسماك نهائياً',
    delete_order_confirm_desc: 'هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح الطلب من النظام.',
    delete_order_btn: 'تأكيد حذف الطلب',
    delete_order_success: 'تم حذف الطلب بنجاح',

    // Customers page
    customers_title: 'سجل عملاء أمير البحار',
    customers_subtitle: 'إدارة بيانات العملاء وعناوين التوصيل وسجل طلباتهم',
    add_customer: 'إضافة عميل جديد',
    import_contacts: 'استيراد من جهات الاتصال',
    import_multiple_device: 'استيراد متعدد من جهات اتصال الجهاز',
    import_multiple_device_desc: 'انقر لتحديد عدة جهات اتصال دفعة واحدة دون الحاجة لكتابة العناوين',
    delete_customer: 'حذف العميل',
    delete_customer_title: 'حذف العميل نهائياً',
    delete_customer_confirm_desc: 'هل أنت متأكد من رغبتك في حذف هذا العميل؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.',
    delete_customer_btn: 'تأكيد حذف العميل',
    admin_controls: 'إجراءات الإدارة',
    danger_zone: 'منطقة الحذف',
    danger_zone_desc: 'حذف بيانات وسجل هذا العميل نهائياً',
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

    // Payments & Collection
    payment_status: 'حالة الدفع والتحصيل',
    payment_status_unpaid: 'غير مدفوع (تحصيل كاش)',
    payment_status_paid: 'مدفوع (تم التحصيل)',
    payment_status_postpaid: 'آجل (توصيل بدون دفع)',
    payment_status_unpaid_desc: 'المبلغ مطلوب تحصيله نقداً من العميل مع الطيار',
    payment_status_paid_desc: 'الطلب مدفوع مقدماً أو تم تحصيله بالكامل',
    payment_status_postpaid_desc: 'تم التسليم بحساب آجل (على النوتة) لتحصيله لاحقاً',
    mark_as_paid: 'تسجيل كـ مدفوع',
    mark_as_postpaid: 'تسجيل كـ آجل',
    mark_as_unpaid: 'إعادة كـ غير مدفوع',
    total_amount_to_pay: 'المبلغ الإجمالي المطلوب دفعه',
    order_mode_quick: '⚡ إدخال المبلغ فقط (سريع)',
    order_mode_detailed: '📋 تفاصيل الأصناف والمنيو (مفصل)',
    quick_amount_placeholder: 'مثال: 350',
    quick_desc_placeholder: 'وصف مختصر (مثال: وجبة سمك مشوي مع أرز)',
    payment_notes_label: 'ملاحظات التحصيل والدفع (اختياري)',
    payment_notes_placeholder: 'مثال: مدفوع إنستاباي / حساب شهري / العميل حول فودافون كاش...',
    filter_all_payments: 'كل حالات الدفع',
    filter_unpaid: 'غير مدفوع (تحصيل كاش)',
    filter_paid: 'مدفوع',
    filter_postpaid: 'آجل (بدون دفع)',
    total_unpaid_stat: 'إجمالي المطلوب تحصيله كاش',
    total_postpaid_stat: 'إجمالي الديون الآجلة',

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
    cat_fresh_fish: 'Fresh Fish',
    cat_seafood: 'Shrimp & Shellfish',
    cat_meals: 'Meals & Casseroles',
    cat_cooking: 'Cooking Styles',
    order_items: 'Order Items',
    item_placeholder: 'e.g. 2 kg Fresh Tilapia grilled with bran',
    quantity: 'Quantity',
    price_egp: 'Price (EGP)',
    add_another_item: 'Add Another Item',
    calculated_total: 'Estimated Total',
    submit_create_order: 'Confirm & Place Seafood Order',
    cancel: 'Cancel',
    edit_order: 'Edit Order',
    edit_order_title: 'Edit Seafood Order #',
    edit_order_desc: 'Modify seafood items, courier, address, or order status.',
    save_changes: 'Save Changes',
    order_status_label: 'Order Status',
    mark_out_for_delivery: 'Out for Delivery',
    mark_delivered: 'Mark as Delivered',
    revert_to_preparing: 'Revert to Preparing',
    delete_order: 'Delete Order',
    delete_order_title: 'Delete Order Permanently',
    delete_order_confirm_desc: 'Are you sure you want to permanently delete this order? This action cannot be undone and will remove the order from the system.',
    delete_order_btn: 'Delete Order',
    delete_order_success: 'Order deleted successfully',

    // Customers page
    customers_title: 'Prince of the Seas Customers',
    customers_subtitle: 'Manage client directory, delivery addresses and order history',
    add_customer: 'Add Customer',
    import_contacts: 'Import Contacts',
    import_multiple_device: 'Import Multiple from Device',
    import_multiple_device_desc: 'Tap to pick multiple contacts from phone without typing addresses',
    delete_customer: 'Delete Customer',
    delete_customer_title: 'Delete Customer Profile',
    delete_customer_confirm_desc: 'Are you sure you want to delete this customer? This action cannot be undone.',
    delete_customer_btn: 'Delete Customer',
    admin_controls: 'Admin Controls',
    danger_zone: 'Danger Zone',
    danger_zone_desc: 'Permanently remove this customer record',
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

    // Payments & Collection
    payment_status: 'Payment Status',
    payment_status_unpaid: 'Unpaid (Collect Cash)',
    payment_status_paid: 'Paid (Collected)',
    payment_status_postpaid: 'On Credit (Postpaid)',
    payment_status_unpaid_desc: 'Amount to be collected in cash upon delivery',
    payment_status_paid_desc: 'Order is paid in advance or collected in full',
    payment_status_postpaid_desc: 'Delivered on credit without immediate payment',
    mark_as_paid: 'Mark as Paid',
    mark_as_postpaid: 'Mark as Postpaid',
    mark_as_unpaid: 'Mark as Unpaid',
    total_amount_to_pay: 'Total Amount to Collect/Pay',
    order_mode_quick: '⚡ Total Amount Only (Quick)',
    order_mode_detailed: '📋 Detailed Items & Menu',
    quick_amount_placeholder: 'e.g. 350',
    quick_desc_placeholder: 'Short description (e.g. Grilled fish meal + rice)',
    payment_notes_label: 'Payment Notes (Optional)',
    payment_notes_placeholder: 'e.g. Paid via InstaPay / Vodafone Cash / monthly tab...',
    filter_all_payments: 'All Payments',
    filter_unpaid: 'Unpaid (Cash)',
    filter_paid: 'Paid',
    filter_postpaid: 'On Credit',
    total_unpaid_stat: 'Total Cash to Collect',
    total_postpaid_stat: 'Total Credit Due',

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
