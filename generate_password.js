const bcrypt = require('bcryptjs');

// Generate hash for admin123
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test the hash
    bcrypt.compare(password, hash, function(err, result) {
        if (err) {
            console.error('Error comparing:', err);
            return;
        }
        console.log('Hash verification:', result);
    });
});
