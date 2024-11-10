const JWT = require("jsonwebtoken");
const secret = "Goku";

function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    Image: user.profileImageURL,
    role: user.role,
  };
  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createToken,
  validateToken,
};
