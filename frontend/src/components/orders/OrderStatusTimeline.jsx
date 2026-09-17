import React from 'react';
import { ChefHat, Truck, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    key: 'preparing',
    label: 'Preparing Order',
    description: 'Kitchen is packing items',
    icon: ChefHat,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Driver is on the way to customer',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Order handed to customer',
    icon: CheckCircle2,
  },
];

export function OrderStatusTimeline({ currentStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
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

          let circleClass = 'bg-white border-2 border-slate-300 text-slate-400';
          if (isCompleted) {
            circleClass = 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-sm';
          } else if (isCurrent) {
            circleClass =
              'bg-white border-2 border-emerald-600 text-emerald-600 ring-4 ring-emerald-100 shadow-md';
          }

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center mt-2">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-emerald-700'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
