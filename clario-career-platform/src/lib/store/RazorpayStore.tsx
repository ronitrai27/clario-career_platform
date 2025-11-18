import axios from "axios";
import { create } from "zustand";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayStore {
  amount: number;
  loading: boolean;
  message: string;

  setAmount: (value: number) => void;
  resetMessage: () => void;
  startPayment: () => Promise<void>;
}

export const useRazorpayStore = create<RazorpayStore>((set, get) => ({
  amount: 500,
  loading: false,
  message: "",

  setAmount: (value) => set({ amount: value }),

  resetMessage: () => set({ message: "" }),

  startPayment: async () => {
    const { amount } = get();
    set({ loading: true, message: "" });

    try {
      const { data: orderData } = await axios.post(
        "/api/razorpay/create-order",
        { amount },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!orderData.orderId) {
        throw new Error("Failed to create order");
      }

      if (!orderData.orderId) throw new Error("Failed to create order");

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Clario",
        description: "Clarity Today , Success Tomorrow",
        order_id: orderData.orderId,
        handler: async (response) => {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            set({ message: "✅ Payment successful!" });
          } else {
            set({ message: "❌ Payment verification failed" });
          }
        },
        prefill: {
          name: "Enter your Name",
          email: "yourname@gmail.com",
          contact: "Enter your phone number",
        },
        theme: {
          color: "#3399cc",
        },
      };
     
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      set({ message: "❌ Payment failed. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
}));
