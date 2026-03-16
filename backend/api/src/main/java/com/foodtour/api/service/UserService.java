package com.foodtour.api.service;

import com.foodtour.api.dto.CreateUserRequest;
import com.foodtour.api.dto.LoginRequest;
import com.foodtour.api.dto.LoginResponse;
import com.foodtour.api.dto.RegisterRequest;
import com.foodtour.api.dto.UserResponse;

import java.util.List;

public interface UserService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
    List<UserResponse> getAllUsers();
    UserResponse createUser(CreateUserRequest request);
    UserResponse toggleUserStatus(Long id, Boolean isActive);
}
