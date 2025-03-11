import { useCallback, useEffect, useNavigate } from "@/lib/vendors";
import { store } from "@/services/store";
import { updateUser } from "@/services/backend/actions";
import { sendToNative } from "@/lib/utils/utils";

const NativeActions = () => {
  const navigate = useNavigate();

  const handleNativeData = useCallback(
    (message: any) => {
      let data = message.data;
      data = JSON.parse(data);

      if (data.goToHome) {
        window.location.reload();
        sendToNative({ type: "reload" });
      }
      if (data.type == "native") {
        store.isNative.set({ isNative: true });
      }
      if ("otaAvailable" in data) {
        if (data.otaAvailable) {
          store.isOtaAvailable.set({ isOtaAvailable: true });
        } else {
          store.isOtaAvailable.set({ isOtaAvailable: false });
        }
      }

      if (data.deviceToken) {
        store.deviceToken.set({ deviceToken: data.deviceToken });
      }

      if ("isDev" in data && data.isDev !== undefined) {
        sendToNative({ idDev: data.isDev });
        if (data.isDev == true) {
          store.isDev.set({ isDev: true });
          store.isUpdateAvailable.set({ isUpdateAvailable: false });
        } else {
          store.isDev.set({ isDev: false });
        }
      }

      if (data.applicationVersion) {
        store.applicationVersion.set({ applicationVersion: data.applicationVersion });
      }

      if (data.buildVersion) {
        store.buildVersion.set({ buildVersion: data.buildVersion });
      }

      if (data.back) {
        let routesToReplace: any = [];
        let currentRoute = location.pathname.replace("/", "");
        if (store.isUpdateAvailable.get().isUpdateAvailable || currentRoute == "") {
          sendToNative({ type: "exit" });
          return;
        }
        if (routesToReplace.includes(currentRoute)) {
          return;
        } else {
          navigate(-1);
        }
      }
    },
    [
      store.isNative.get().isNative,
      store.isOtaAvailable.get().isOtaAvailable,
      store.deviceToken.get().deviceToken,
      store.isDev.get().isDev,
      store.isUpdateAvailable.set,
      store.applicationVersion.get().applicationVersion,
      store.buildVersion.get().buildVersion,
      store.isUpdateAvailable.get().isUpdateAvailable,
    ]
  );

  useEffect(() => {
    document.addEventListener("message", (message: any) => handleNativeData(message));
    return () => {
      document.removeEventListener("message", (message: any) => {});
    };
  }, [handleNativeData]);

  useEffect(() => {
    const handleUpdateDeviceToken = async () => {
      const body = { device_token: store.deviceToken.get().deviceToken };
      const res = await updateUser(store.auth.get().user?.id, body);

      if (res.err) {
        return;
      }
    };

    if (store.deviceToken.get().deviceToken && store.auth.get().user?.id) {
      handleUpdateDeviceToken();
    }
  }, [store.deviceToken.get().deviceToken, store.auth.get().user?.id]);

  return null;
};

export default NativeActions;
