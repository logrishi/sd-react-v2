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

  useEffect(() => {
    document.addEventListener("message", (message: any) => handleNativeData(message));
    return () => {
      document.removeEventListener("message", (message: any) => {});
    };
  }, []);

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
    console.log("milliseconds", milliseconds);
    console.log("num", num);
    console.log("rand", rand);
    console.log("txnId", txnId);
    try {
      const res = await axios.post("https://arodos-payments.vercel.app/pay", {
        txnId: txnId,
        userId: store.auth.get().user.id,
        amount: 200,
        mobileNumber: 9954066643,
        // redirectUrl: `https://saraighatdigital-pay.netlify.app/status/${txnId}`,
        redirectUrl: `http://localhost:5173/status/${txnId}`,
        callbackUrl: `https://arodos-payments.vercel.app/checkStatus/${txnId}`,
      });
      console.log("res", res.data);
      // alert(res.data);
      window.open(res.data, "_self");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* <div className="w-full h-screen flex flex-col space-y-5 justify-center items-center">
        <p className="font-bold text-slate-600 text-xl">Pay now to complete your transaction!</p>
        <Button
          className="bg-[#06BCA4] w-56 h-16 rounded-md font-bold text-white"
          title="Make Payment"
          onClick={handlePay}
          disabled={loading}
        />
      </div> */}
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
        >
          Subscribe Now
        </Button>
      </Alert>
    </>
  );
};

export default Pay;
