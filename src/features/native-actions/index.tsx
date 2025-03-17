import { useCallback, useEffect, useNavigate } from "@/lib/vendors";

import { sendToNative } from "@/lib/utils/utils";
import { store } from "@/services/store";
import { updateUser } from "@/services/backend/actions";

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
        const auth = store.auth.get();
        store.auth.set({
          ...auth,
          deviceToken: data.deviceToken,
        });
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
      store.auth.get().deviceToken,
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
      const auth = store.auth.get();
      const body = { device_token: auth.deviceToken };
      const res = await updateUser(auth.user?.id, body);

      if (res.err) {
        return;
      }
    };

    const auth = store.auth.get();
    if (auth.deviceToken && auth.user?.id) {
      handleUpdateDeviceToken();
    }
  }, [store.auth.get().deviceToken, store.auth.get().user?.id]);

  return null;
};

export default NativeActions;
