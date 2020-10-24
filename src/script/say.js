const text2wav = require('text2wav');

async function ToMP3(text) {
  try {
    return await text2wav(text, {
      voice: 'en+Andy', pitch: 80, lineLength: 5, speed: 175,
    });
  } catch (error) {
    console.log('Error', error);
  }
}
module.exports = {
  ToMP3,
};
