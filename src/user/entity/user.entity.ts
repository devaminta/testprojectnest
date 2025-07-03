export interface User {
  fullname: string;
  email: string;
  password: string;
  role: 'User' | 'Admin';
}
