import React from 'react';
import { Flame, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function OrderStatusTimeline({ currentStatus }) {
  const { language } = useLanguage();

  const STEPS = [
    {
      key: 'preparing',
      labelAr: 'تنظيف وطهي الأسماك',
      labelEn: 'Fish Prep & Cooking',
      descAr: 'المطبخ يجهز الأسماك والتتبيلة',
      descEn: 'Kitchen is prepping seafood',
      icon: Flame,
    },
    {
      key: 'out_for_delivery',
      labelAr: 'في طريق التوصيل',
      labelEn: 'Out for Delivery',
      descAr: 'الكابتن في الطريق للعميل',
      descEn: 'Courier is heading to customer',
      icon: Truck,
    },
    {
      key: 'delivered',
      labelAr: 'تم التسليم بنجاح',
      labelEn: 'Delivered',
      descAr: 'تم تسليم الوجبة للعميل',
      descEn: 'Handed to customer',
      icon: CheckCircle2,
    },
  ];

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width:
                currentIndex <= 0
                  ? '0%'
                  : currentIndex === 1
                  ? '50%'
                  : '100%',
            }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let circleClass = 'bg-[#0B1019] border border-slate-700 text-slate-500';
          if (isCompleted) {
            circleClass = 'bg-emerald-600 border border-emerald-500 text-white shadow-button';
          } else if (isCurrent) {
            circleClass = 'bg-blue-600 border border-blue-400 text-white shadow-button';
          }

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${circleClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-center mt-2">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-blue-400'
                      : isCompleted
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {language === 'ar' ? step.labelAr : step.labelEn}
                </p>
                <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                  {language === 'ar' ? step.descAr : step.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
