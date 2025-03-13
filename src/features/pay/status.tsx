import { store } from "@/services/store";
import { axios, useEffect, useParams, useState, useNavigate } from "@/lib/vendors";
import { CheckCircle2, XCircle } from "@/assets/icons";
import dayjs from "dayjs";
import { updateUser } from "@/services/backend/actions";
import { sendToNative } from "@/lib/utils/utils";

// export function sendToNative(data: any) {
//   if (data?.type == "pay-status") {
//     if (store.isNative.get().isNative) {
//       //@ts-ignore
//       window.ReactNativeWebView.postMessage(JSON.stringify(data));
//     }
//   }
// }

const Status = () => {
  const { txnId } = useParams<{ txnId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (txnId) {
      verifyTxn(txnId);
    }
  }, [txnId]);

  async function verifyTxn(txnId: any) {
    try {
      const res = await axios.post(`https://arodos-payments.vercel.app/checkStatus/${txnId}`, {});
      // sendToNative({ type: "pay-status", data: res?.data });

      // Check payment status from response
      if (res?.data?.success) {
        // Generate expiry date (1 year from now)
        const expiryDate: any = dayjs().add(1, "year").format("YYYY-MM-DD");

        // Generate receipt number
        const timestamp = dayjs().format("YYYYMMDDHHmmss");
        const receipt = `SD_Rec_${timestamp}`;

        // Update user subscription details
        const userId = store.auth.get().user.id;
        const updateData = {
          is_subscribed: 1,
          expiry_date: expiryDate,
          payment_details: {
            transactionId: res.data.data.transactionId,
            merchantTransactionId: res.data.data.merchantTransactionId,
            receipt,
          },
        };

        try {
          const res = await updateUser(userId, updateData);
          if (!res?.err) {
            // Update auth state
            store.auth.set({
              ...store.auth.get(),
              expiryDate,
              isSubscribed: true,
              isSubscriptionExpired: false,
            });

            setStatus("success");
            // Redirect after showing success message
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 5000);
          }
        } catch (error) {
          console.error("Failed to update subscription:", error);
          setStatus("error");
        }
      } else {
        console.error("Payment verification failed:", res.data);
        setStatus("error");
        // Redirect after showing error message
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 5000);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
      // Redirect after showing error message
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 5000);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 p-6 text-center">
        {status === "loading" && (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="space-y-2">
              <p className="text-base md:text-lg font-semibold text-foreground">Processing Payment</p>
              <p className="text-xs md:text-sm text-muted-foreground">Please don't close this window or navigate away.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-16 w-16 text-success animate-in fade-in" />
            <div className="space-y-2">
              <p className="text-base md:text-lg font-semibold text-foreground">Payment Successful!</p>
              <p className="text-xs md:text-sm text-muted-foreground">Redirecting you to home page...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-destructive animate-in fade-in" />
            <div className="space-y-2">
              <p className="text-base md:text-lg font-semibold text-foreground">Payment Failed</p>
              <p className="text-xs md:text-sm text-muted-foreground">Redirecting you to home page...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Status;
