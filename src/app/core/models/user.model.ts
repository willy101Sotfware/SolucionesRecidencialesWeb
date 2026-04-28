export interface UserResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  activo: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nombreCompleto: string;
}

export interface UpdateUserRequest {
  id: number;
  username: string;
  nombreCompleto: string;
  activo: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}
