import jwt from "jsonwebtoken";

const verifyToken = (req, res, next)=>{
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated!", status_code : 401 });
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
    if (err)
      return res.status(401).json({ message: "Invalid or expired token!" });

    req.user = decoded;
    next()
  })
}

const getUserProfile = (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully!",
    user: req.user,
  });
};


export { verifyToken, getUserProfile };