// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');
api_key= process.env.Firebase_config_token
const firebaseConfig = {
    apiKey: api_key,
    authDomain: "realsmileappss.firebaseapp.com",
    projectId: "realsmileappss",
    storageBucket: "realsmileappss.appspot.com",
    messagingSenderId: "860202006229",
    appId: "1:860202006229:web:d7a6cf3bf273273a26545c"
};
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(payload)
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './realSmileLogo.png',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});