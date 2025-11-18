'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
  name: string
  free: boolean
  premium: boolean
  enterprise: boolean
}

const FEATURES: Feature[] = [
  { name: 'Unlimited Components', free: true, premium: true, enterprise: true },
  { name: 'Easily edited and customized', free: true, premium: true, enterprise: true },
  { name: 'Combine Files Mercurius', free: true, premium: true, enterprise: true },
  { name: 'Health care included', free: false, premium: true, enterprise: true },
  { name: 'Priority Support', free: false, premium: true, enterprise: true },
  { name: 'Advanced Analytics', free: false, premium: false, enterprise: true },
  { name: 'Custom Integrations', free: false, premium: false, enterprise: true },
  { name: 'Dedicated Account Manager', free: false, premium: false, enterprise: true },
]

export function PricingFeaturesTable() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          {/* Table Header */}
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free Plan</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Premium Plan</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise Plan</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {FEATURES.map((feature, index) => (
              <tr key={index} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                <td className="px-6 py-4 text-sm text-gray-700">{feature.name}</td>
                <td className="px-6 py-4 text-center">
                  {feature.free ? (
                    <Check className="mx-auto h-5 w-5 text-gray-800" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {feature.premium ? (
                    <Check className="mx-auto h-5 w-5 text-gray-800" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {feature.enterprise ? (
                    <Check className="mx-auto h-5 w-5 text-gray-800" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
