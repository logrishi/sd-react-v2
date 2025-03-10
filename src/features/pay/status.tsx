import { store } from "@/services/store";
import { axios, useEffect, useParams } from "@/lib/vendors";

export function sendToNative(data: any) {
  if (data?.type == "pay-status") {
    if (store.isNative.get().isNative) {
      //@ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  }
}

const Status = () => {
  const { txnId } = useParams<{ txnId: string }>();
  console.log("txnId", txnId);

  useEffect(() => {
    console.log("first");
    if (txnId) {
      verifyTxn(txnId);
    }
  }, [txnId]);

  async function verifyTxn(txnId: any) {
    try {
      const res = await axios.post(`https://arodos-payments.vercel.app/checkStatus/${txnId}`, {});
      sendToNative({ type: "pay-status", data: res?.data });
    } catch (error) {
      // console.log("error", error);
    }
  }
  return (
    <div className="flex flex-col h-screen item-center justify-center px-16 pb-20">
      <p className="font-bold text-slate-600 text-md text-center">Processing......</p>
      <p className="font-bold text-slate-600 text-md text-center">Hold on! Don't navigate away from this page!</p>
    </div>
  );
};

export default Status;
