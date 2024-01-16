
function validateUsername(username) {
    // Should contain only letters, numbers, underscores, and be between 3 and 20 characters
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  }
  
  function validateEmail(email) {
    // Basic email format validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  function validatePassword(password) {
    // Should contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one digit
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }
  
  function validateFullName(fullName) {
    // Should contain only letters and spaces and be between 2 and 50 characters
    const regex = /^[a-zA-Z\s]{2,50}$/;
    return regex.test(fullName);
  }

  export {validateEmail,validatePassword,validateUsername,validateFullName}