import Jimp from "jimp";

export default (src, MAX_WIDTH) => {
  return new Promise(res => {
    Jimp.read(src, function (err, image) {
      if (err || !image) {
        return res({ error: true, message: err });
      }

      if (image.bitmap.width > MAX_WIDTH) {
        image.resize(MAX_WIDTH, Jimp.AUTO);
      }
      image.getBuffer(image.getMIME(), (err, body) => {
        if (err) {
          return res({ error: true, message: err });
        }

        return res({ body });
      });
    });
  });
};
