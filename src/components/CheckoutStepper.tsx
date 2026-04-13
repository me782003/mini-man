'use client';

import React from 'react';
import { CircleCheckBig, CreditCard, MapPin } from 'lucide-react';

const STEPS = [
    { label: 'Shipping', icon: <MapPin className="w-4 h-4 md:w-6 md:h-6" /> },
    { label: 'Payment', icon: <CreditCard className="w-4 h-4 md:w-6 md:h-6" /> },
    { label: 'Checkout', icon: <CircleCheckBig className="w-4 h-4 md:w-6 md:h-6" /> },
];

interface CheckoutStepperProps {
    currentStep: number;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
    return (
        <div className="mb-5 md:mb-8 flex items-center bg-[#7575751A] border border-[#D7D7D7] px-[20px] md:px-10 py-[15px] md:py-5">
            {STEPS.map((step, index) => (
                <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`flex h-[32px] md:h-12 w-[32px] md:w-12 items-center justify-center rounded-full border-2 transition-colors ${
                                index <= currentStep
                                    ? 'border-[#6aaa84] bg-[#6aaa84] text-white'
                                    : 'border-gray-300 bg-white text-gray-400'
                            }`}
                        >
                            {step.icon}
                        </div>
                        <span
                            className={`font-beatrice text-[12px] md:text-[14px] font-medium ${
                                index === currentStep
                                    ? 'font-bold text-black'
                                    : index < currentStep
                                        ? 'text-black'
                                        : 'text-gray-400'
                            }`}
                        >
                            {step.label}
                        </span>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div
                            className={`mx-4 mb-6 h-[2px] rounded-full flex-1 ${
                                index < currentStep ? 'bg-[#6aaa84]' : 'bg-[#D7D7D7]'
                            }`}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
