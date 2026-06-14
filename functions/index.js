const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendPushNotification = onValueCreated(
  {
    ref: "/pushQueue/{pushId}",
    instance: "mmstudio-86917-default-rtdb"
  },
  async (event) => {
    const data = event.data.val();
    if (!data || !data.token) return;

    const message = {
      token: data.token,
      data: {
        title: data.title || "MM Studio",
        body: data.body || "Новое сообщение",
        url: data.url || "/mmstudio/admin/chat.html"
      },
      webpush: {
        notification: {
          title: data.title || "MM Studio",
          body: data.body || "Новое сообщение",
          icon: "/mmstudio/assets/favicon.svg",
          badge: "/mmstudio/assets/favicon.svg",
          tag: "chat-msg",
          requireInteraction: true
        },
        fcmOptions: {
          link: data.url || "/mmstudio/admin/chat.html"
        }
      }
    };

    try {
      await admin.messaging().send(message);
      console.log("Push sent to", data.token.substring(0, 20) + "...");
    } catch (err) {
      console.error("Push error:", err.message);
      if (err.code === "messaging/registration-token-not-registered") {
        const uid = data.token;
        const tokensRef = admin.database().ref("fcmTokens");
        const snap = await tokensRef.once("value");
        snap.forEach((child) => {
          if (child.val() === data.token) child.ref.remove();
        });
      }
    }

    await event.data.ref.remove();
  }
);
