import FCM from "fcm-node";
// import serverKey from "../firebase.json";
export const sendPushNotification = async(notificationData) => {
  const fcmServerkey = process.env.FCM_SERVER_KEY
  try {
    var fcm = new FCM(fcmServerkey);
    var message = {
      to: "",
      // collapse_key: "your_collapse_key",
      notification: {
        title: "Title of your push notification",
        body: "Body of your push notification",
      },
    };
    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};
