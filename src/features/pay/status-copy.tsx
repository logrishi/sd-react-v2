import { store } from "@/services/store";
import { axios, useEffect, useParams, useState, useNavigate, type FC } from "@/lib/vendors";
import { CheckCircle2, XCircle } from "@/assets/icons";
import dayjs from "dayjs";
import { updateUser } from "@/services/backend/actions";
import { sendToNative } from "@/lib/utils/utils";
import { Sheet, SheetContent } from "@/components/common/ui/sheet";
import { type ReactElement } from "react";

// export function sendToNative(data: any) {
//   if (data?.type == "pay-status") {
//     if (store.isNative.get().isNative) {
//       //@ts-ignore
//       window.ReactNativeWebView.postMessage(JSON.stringify(data));
//     }
//   }
// }

interface StatusProps {
  txnId?: string;
  isModal?: boolean;
  onComplete?: () => void;
}

const Status: FC<StatusProps> = ({ txnId: propTxnId, isModal = false, onComplete }): ReactElement => {
  const { txnId: paramTxnId } = useParams<{ txnId: string }>();
  const txnId = propTxnId || paramTxnId;
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Verify payment attempt and prevent back navigation
  useEffect(() => {
    if (!txnId) {
      if (!isModal) {
        navigate("/", { replace: true });
      }
      return;
    }

    // Prevent back navigation
    const preventNavigation = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
    };
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", preventNavigation);

    // Verify payment attempt from store
    const currentPayment = store.payment.get().currentPayment;
    if (!currentPayment?.txnId || !currentPayment?.timestamp || !currentPayment?.userId) {
      if (!isModal) {
        navigate("/", { replace: true });
      }
      return;
    }

    // Verify user and transaction
    const currentUserId = store.auth.get().user?.id;
    if (currentPayment.userId !== currentUserId || currentPayment.txnId !== txnId) {
      if (!isModal) {
        navigate("/", { replace: true });
      }
      return;
    }

    // Verify timestamp (payment attempt should be within last 10 minutes)
    const now = new Date().getTime();
    const isExpired = now - currentPayment.timestamp > 10 * 60 * 1000; // 10 minutes
    if (isExpired) {
      store.payment.set({ currentPayment: { txnId: "", timestamp: 0, userId: "" } });
      if (!isModal) {
        navigate("/", { replace: true });
      }
      return;
    }

    // Clean up on unmount
    return () => {
      window.removeEventListener("popstate", preventNavigation);
    };
  }, [navigate, txnId]);

  useEffect(() => {
    if (txnId) {
      verifyTxn(txnId);
    }
  }, [txnId]);

  const verifyTxn = async (txnId: string) => {
    try {
      const res = await axios.post(`https://arodos-payments.vercel.app/checkStatus/${txnId}`, {});
      // sendToNative({ type: "pay-status", data: res?.data });

      // Check payment status from response
      if (res?.data?.success) {
        // Generate expiry date (1 year from now)
        const expiryDate = dayjs().add(1, "year").format("YYYY-MM-DD");

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
          const updateRes = await updateUser(userId, updateData);
          if (!updateRes?.err) {
            // Update auth state
            const currentAuth = store.auth.get();
            if (currentAuth?.user) {
              store.auth.set({
                ...currentAuth,
                isSubscribed: true,
                isSubscriptionExpired: false,
                expiryDate: undefined,
              });
            }

            // Clear payment state
            store.payment.set({ currentPayment: { txnId: "", timestamp: 0, userId: "" } });

            setStatus("success");
            // Redirect after showing success message
            setTimeout(() => {
              if (isModal && onComplete) {
                onComplete();
              } else {
                navigate("/", { replace: true });
              }
            }, 5000);
          }
        } catch (error) {
          console.error("Failed to update subscription:", error);
          setStatus("error");
          setTimeout(() => {
            if (isModal && onComplete) {
              onComplete();
            } else {
              navigate("/", { replace: true });
            }
          }, 5000);
        }
      } else {
        console.error("Payment verification failed:", res.data);
        setStatus("error");
        // Clear payment state
        store.payment.set({ currentPayment: { txnId: "", timestamp: 0, userId: "" } });
        // Redirect after showing error message
        setTimeout(() => {
          if (isModal && onComplete) {
            onComplete();
          } else {
            navigate("/", { replace: true });
          }
        }, 5000);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
      // Clear payment state
      store.payment.set({ currentPayment: { txnId: "", timestamp: 0, userId: "" } });
      // Redirect after showing error message
      setTimeout(() => {
        if (isModal && onComplete) {
          onComplete();
        } else {
          navigate("/", { replace: true });
        }
      }, 5000);
    }
  };

  const content = (
    <div className="flex flex-col items-center gap-6 p-6 text-center">
      {status === "loading" && (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Processing Payment</p>
            <p className="text-sm text-muted-foreground">Please don't close this window or navigate away.</p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-success animate-in fade-in" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">{isModal ? "Closing..." : "Redirecting you to home page..."}</p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-16 w-16 text-destructive animate-in fade-in" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Payment Failed</p>
            <p className="text-sm text-muted-foreground">{isModal ? "Closing..." : "Redirecting you to home page..."}</p>
          </div>
        </>
      )}
    </div>
  );

  if (isModal) {
    return (
      <Sheet open={true} onOpenChange={() => onComplete?.()}>
        <SheetContent 
          side="bottom" 
          className="h-auto sm:h-auto overflow-y-auto" 
          onEscapeKeyDown={() => onComplete?.()}
          onPointerDownOutside={() => onComplete?.()}
        >
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      {content}
    </div>
  );
};

export default Status;
