const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');

exports.tbaAPI = functions.https.onCall((data, context) => {
  console.log(JSON.stringify(data));
  console.log(JSON.stringify(context));
  return cors(data, context, async () => {
    const { route } = data;
    try {
      const response = await axios.get(
        'https://www.thebluealliance.com/api/v3/' + route,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-TBA-Auth-Key': 'functions.config().tba.id',
          },
        }
      );
      return JSON.stringify(response.data);
    } catch (e) {
      console.log(JSON.stringify(e));
      throw new functions.https.HttpsError(
        'failed-request',
        'Could not connect to API'
      );
    }
  });
});
