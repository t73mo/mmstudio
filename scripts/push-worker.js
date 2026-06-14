const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://mmstudio-86917-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

async function processPushQueue() {
  const snapshot = await db.ref('pushQueue').once('value');
  const queue = snapshot.val();
  if (!queue) { console.log('Queue empty'); return; }

  const entries = Object.entries(queue);
  console.log(`Processing ${entries.length} push(es)...`);

  for (const [key, item] of entries) {
    try {
      if (!item || !item.token) {
        await db.ref('pushQueue/' + key).remove();
        continue;
      }
      await admin.messaging().send({
        token: item.token,
        notification: {
          title: item.title || 'MM Studio',
          body: item.body || '',
        },
        webpush: {
          fcm_options: { link: item.url || 'https://t73mo.github.io/mmstudio/admin/chat.html' }
        }
      });
      console.log('Sent to:', item.token.substring(0, 20) + '...');
    } catch (err) {
      console.error('Send failed:', err.message);
      if (err.code === 'messaging/registration-token-not-registered') {
        const tokensSnap = await db.ref('fcmTokens').once('value');
        const tokens = tokensSnap.val() || {};
        for (const [userId, token] of Object.entries(tokens)) {
          if (token === item.token) {
            await db.ref('fcmTokens/' + userId).remove();
            console.log('Removed invalid token for', userId);
          }
        }
      }
    }
    await db.ref('pushQueue/' + key).remove();
  }
  console.log('Done');
}

processPushQueue().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
