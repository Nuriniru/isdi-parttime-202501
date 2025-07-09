export const registerUser = (userData) => {
  // Validation
  if (!userData.email || !userData.password) {
    throw new Error('Datos de registro incompletos');
  }
  
  if (userData.password !== userData['confirmation-password']) {
    throw new Error('Las contraseñas no coinciden');
  }

  // Get existing users
  const usersJson = localStorage.getItem('users');
  const users = usersJson ? JSON.parse(usersJson) : [];

  // Check if user exists
  const doesUserExist = users.some(user => user.email === userData.email);
  
  if (doesUserExist) {
    throw new Error('Este correo ya está en uso');
  }

  // Create new user
  const username = userData.email.split('@')[0];
  const userCreated = { 
    email: userData.email, 
    password: userData.password, 
    username: username, 
    id: Date.now().toString()  // Use string ID for consistency
  };

  // Store users in localStorage instead of sessionStorage
  users.push(userCreated);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(userCreated));

  return userCreated;
};

export const loginUser = (loginData) => {
  const usersJson = localStorage.getItem('users');
  const users = JSON.parse(usersJson) || [];

  const userLoginCheckout = users.find(user => 
    user.email === loginData.email && user.password === loginData.password
  );

  if (!userLoginCheckout) {
    throw new Error('Credenciales incorrectas');
  }

  // Always store current user in localStorage
  localStorage.setItem('currentUser', JSON.stringify(userLoginCheckout));

  return userLoginCheckout;
};

export const getUserFromStorage = () => {
  const currentUserJson = localStorage.getItem('currentUser');
  return currentUserJson ? JSON.parse(currentUserJson) : null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};