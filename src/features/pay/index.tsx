import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { Button } from "@/components/common/ui/button";
import { axios, useState, useEffect, useNavigate } from "@/lib/vendors";
import { store } from "@/services/store";
import { AlertTriangle } from "@/assets/icons";
import { useAccessControl } from "@/lib/hooks/useAccessControl";

const Pay = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [phone, setPhone] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { checkAccess } = useAccessControl();
  const navigate = useNavigate();
  const { isLoggedIn, isSubscribed, isSubscriptionExpired } = store.auth.get();

  function handleNativeData(message: any) {
    let data = message.data;
    data = JSON.parse(data);
    if (data?.type == "native") {
      store.isNative.set({ isNative: true });
    }
    if (data?.userId) {
      setUserId(data.userId);
    }
    if (data.amount) {
      setAmount(data.amount);
    }
    // if (data.phone) {
    //   setPhone(data.phone);
    // }
  }

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
    let rand = "";
    const milliseconds = new Date().getTime();
    const num = Math.floor(Math.random() * 10);
    rand = "txnId" + milliseconds + num;
    const txnId: any = rand.toString();
    try {
      const res = await axios.post("https://arodos-payments.vercel.app/pay", {
        txnId: txnId,
        userId: store.auth.get().user.id,
        amount: store.appSettings.get().price,
        mobileNumber: 9954066643,
        // redirectUrl: `https://saraighatdigital-pay.netlify.app/status/${txnId}`,
        // redirectUrl: `http://localhost:5173/status/${txnId}`,
        redirectUrl:
          window.location.hostname == "saraighatdigital.com"
            ? `https://saraighatdigital.com/status/${txnId}`
            : `http://localhost:5173/status/${txnId}`,
        callbackUrl: `https://arodos-payments.vercel.app/checkStatus/${txnId}`,
      });
      window.open(res.data, "_self");
    } catch (error: any) {
      // console.log("error", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Alert className="mb-4 border-primary flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex items-start md:items-center">
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-primary mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
          <AlertDescription className="text-xs md:text-sm text-foreground">{alertMessage}</AlertDescription>
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
              <span className="text-xs md:text-sm">Processing...</span>
            </>
          ) : (
            <span className="text-xs md:text-sm">Subscribe Now</span>
          )}
        </Button>
      </Alert>
    </>
  );
};

export default Pay;
