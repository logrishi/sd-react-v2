import { useCallback, useEffect, useNavigate, useRef } from "@/lib/vendors";

import { sendToNative } from "@/lib/utils/utils";
import { store } from "@/services/store";
import { updateUser } from "@/services/backend/actions";

const NativeActions = () => {
  const navigate = useNavigate();
  const previousDeviceTokenRef = useRef<string | null>(null);

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
        // Only update if the new token is different from existing one
        if (data.deviceToken && data.deviceToken !== auth.deviceToken) {
          store.auth.set({
            ...auth,
            deviceToken: data.deviceToken,
          });
        }
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
      const currentDeviceToken = auth.deviceToken;

      // Only update if token has changed since last update
      if (currentDeviceToken && currentDeviceToken !== previousDeviceTokenRef.current && auth.user?.id) {
        const body = { device_token: currentDeviceToken };
        const res = await updateUser(auth.user.id, body);

        if (!res.err) {
          // Update our ref to avoid unnecessary future updates
          previousDeviceTokenRef.current = currentDeviceToken;
        }
      }
    };

    const auth = store.auth.get();
    // Only call if deviceToken exists and has changed
    if (auth.deviceToken && auth.deviceToken !== previousDeviceTokenRef.current && auth.user?.id) {
      handleUpdateDeviceToken();
    }
  }, [store.auth.get().deviceToken, store.auth.get().user?.id]);

  return null;
};

export default NativeActions;
