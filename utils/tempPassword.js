const crypto = require('crypto');

export function generateTempPassword(length = 6) {
       const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       let password = '';

       // Create an array of 32-bit unsigned integers
       const randomValues = new Uint32Array(length);
       crypto.getRandomValues(randomValues);

       for (let i = 0; i < length; i++) {
              // Use the random value to select a character from the chars string
              password += chars[randomValues[i] % chars.length];
       }

       return password;
}