import React from 'react';
import { Flame, Truck, CheckCircle2, Fish } from 'lucide-react';
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
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
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
          const isPending = idx > currentIndex;

          let circleClass = 'bg-[#041222] border-2 border-slate-700 text-slate-500';
          if (isCompleted) {
            circleClass = 'bg-gradient-to-tr from-cyan-600 to-teal-500 border-2 border-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25';
          } else if (isCurrent) {
            circleClass =
              'bg-[#061e38] border-2 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30';
          }

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${circleClass}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center mt-2">
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-cyan-300'
                      : isCompleted
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {language === 'ar' ? step.labelAr : step.labelEn}
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
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
