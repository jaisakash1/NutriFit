const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hashedPassword);
  return hashedPassword;
};

// Example usage
const password = 'Admin123!'; // Your admin password
hashPassword(password)
  .then(hashedPassword => {
    console.log('\nUse this in MongoDB Compass:');
    console.log('{\n  password: "' + hashedPassword + '"\n}');
  })
  .catch(console.error); 