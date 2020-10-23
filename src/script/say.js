const text2wav = require('text2wav');
const fs = require('fs');

async function ToMP3(text) {
  try {
    const out = await text2wav(text, {
      wordGap: 12, pitch: 60,
    });
    await fs.writeFile('test.mp3', out, () => {
      console.log('done');
    });
  } catch (error) {
    console.log('Error', error);
  }
}
module.exports = {
  ToMP3,
};
