import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { Button } from "@/components/common/ui/button";
import { axios, useState, useEffect, useNavigate } from "@/lib/vendors";
import { store } from "@/services/store";
import { AlertTriangle } from "@/assets/icons";
import { useAccessControl } from "@/lib/hooks/useAccessControl";

interface PayProps {
  onPaymentComplete?: (txnId: string) => void;
}

const Pay = ({ onPaymentComplete }: PayProps) => {
  const [loading, setLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { checkAccess } = useAccessControl();
  const navigate = useNavigate();
  const { isLoggedIn, isSubscribed, isSubscriptionExpired } = store.auth.get();

  // Check access status and set alert message
  useEffect(() => {
    const { canAccess, message } = checkAccess();

    if (!canAccess) {
      setShowAlert(true);

      if (!isLoggedIn || !isSubscribed) {
        setAlertMessage("Subscribe to gain access to e-books and audiobooks");
      } else if (isSubscriptionExpired) {
        setAlertMessage("Renew your subscription to continue access to e-books and audiobooks");
      } else {
        setAlertMessage(message);
      }
    } else {
      setShowAlert(false);
    }
  }, [isLoggedIn, isSubscribed, isSubscriptionExpired]);

  async function handlePay() {
    console.log("pay");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setLoading(true);
    // Generate transaction ID
    const milliseconds = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 10000);
    const txnId = `txnId${milliseconds}${randomNum}`;

    // Store payment attempt in store
    store.payment.set({
      currentPayment: {
        txnId,
        timestamp: milliseconds,
        userId: store.auth.get().user.id
      }
    });

    try {
      const res = await axios.post("https://arodos-payments.vercel.app/pay", {
        txnId: txnId,
        userId: store.auth.get().user.id,
        amount: 1,
        mobileNumber: 9954066643,
        redirectUrl: `http://localhost:5173/status/${txnId}`,
        callbackUrl: `https://arodos-payments.vercel.app/checkStatus/${txnId}`,
      });
      console.log("res", res.data);
      // alert(res.data);
      if (onPaymentComplete) {
        onPaymentComplete(txnId);
      } else {
        window.open(res.data, "_self");
      }
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showAlert && (
        <Alert className="mb-4 border-primary flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex items-start md:items-center">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-primary mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
            <AlertDescription className="text-foreground">{alertMessage}</AlertDescription>
          </div>
          <Button
            size="sm"
            variant="default"
            className="bg-primary hover:bg-primary/90 w-full md:w-auto"
            onClick={() => {
              if (!isLoggedIn) {
                navigate("/login");
              } else {
                handlePay();
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>
        </Alert>
      )}
    </>
  );
};

export default Pay;
