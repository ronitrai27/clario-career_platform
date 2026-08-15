import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRazorpayStore } from "@/lib/store/RazorpayStore";
import Script from 'next/script';

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isFeatured?: boolean;
  isYearly?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isFeatured = false,
  isYearly = false,
}: PricingCardProps) {
  const displayPrice = isYearly ? Math.round(price * 0.8) : price;

  const { amount, loading, message, setAmount, startPayment } =
    useRazorpayStore();

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div
        className={cn(
          "flex flex-col rounded-2xl p-6 transition-all duration-300",
          isFeatured
            ? "border-0 bg-gradient-to-br from-indigo-400 to-rose-400 text-white shadow-2xl md:-mt-6"
            : "border border-gray-200 bg-white/50 backdrop-blur"
        )}
      >
        <div className="mb-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-4xl font-bold",
                isFeatured ? "text-white" : "text-black"
              )}
            >
              ₹{displayPrice}
            </span>
            <span className={isFeatured ? "text-white" : "text-gray-500"}>
              Per Month
            </span>
          </div>
          <p
            className={cn(
              "text-sm",
              isFeatured ? "text-gray-300" : "text-gray-600"
            )}
          >
            {description}
          </p>
        </div>

        {name == "Free Plan" ? (
          <Button
            className={cn(
              "mb-6 rounded-full font-semibold font-inter tracking-tight transition-colors",
              "border border-gray-800 bg-indigo-100 text-black hover:bg-gray-100"
            )}
            variant="outline"
          >
            2K+ Worth Joining Bonus
          </Button>
        ) : (
          <Button
            onClick={() => {
              setAmount(displayPrice);
              startPayment();
            }}
            disabled={loading}
            className={cn(
              "mb-6 rounded-full font-semibold transition-colors cursor-pointer",
              isFeatured
                ? "border-white bg-white text-black hover:bg-gray-100"
                : "border border-gray-800 bg-transparent text-gray-800 hover:bg-gray-100"
            )}
            variant="outline"
          >
            {loading ? "Loading..." : "Get Started"}
          </Button>
        )}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check
                className={cn(
                  "mt-0.5 h-5 w-5 flex-shrink-0",
                  isFeatured ? "text-white" : "text-gray-800"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isFeatured ? "text-gray-100" : "text-gray-700"
                )}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
