// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Generate JWT Token
// const generateToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: '30d'
//   });
// };

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, experienceLevel } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'User already exists' 
//       });
//     }

//     // Create user
//     const user = new User({
//       name,
//       email,
//       password,
//       experienceLevel
//     });

//     await user.save();

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         experienceLevel: user.experienceLevel
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error registering user', 
//       error: error.message 
//     });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Invalid credentials' 
//       });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Invalid credentials' 
//       });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         experienceLevel: user.experienceLevel,
//         reputationScore: user.reputationScore
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error logging in', 
//       error: error.message 
//     });
//   }
// };

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select('-password');
//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching user', 
//       error: error.message 
//     });
//   }
// };