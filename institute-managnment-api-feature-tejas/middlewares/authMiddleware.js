export const validateSignup = (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, Password, and Role are required." });
  }
  next();
};

export const validateSignin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Username and Password are required." });
  }
  next();
};
