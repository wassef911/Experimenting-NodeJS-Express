const fs = require('fs');
const txtomp3 = require('text-to-mp3');

async function ToMP3() {
  try {
    await txtomp3.saveMP3('Test PDF Freddie Mercury (born Farrokh Bulsara; 5 September 1946 – 24 November 1991)[2] was a British singer, songwriter, record producer, and lead vocalist of the rock band Queen. for his flamboyant stage persona and four-octave vocal range. Mercury defied the conventions of a rock frontman, with his highly theatrical style influencing the artistic direction of Queen.', 'FileName', { tl: 'ar' }).then((path) => {
      console.log('File saved :', path);
    });
  } catch (error) {
    console.log('Error', error);
  }
}
module.exports = {
  ToMP3,
};
