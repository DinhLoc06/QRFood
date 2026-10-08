package com.qrfood.auth;

import com.qrfood.common.error.BusinessException;
import com.qrfood.common.error.ErrorCode;
import com.qrfood.config.JwtService;
import com.qrfood.user.User;
import com.qrfood.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND));

        String storedPassword = user.getPassword();
        boolean matches = storedPassword != null && (
                storedPassword.startsWith("$2") && passwordEncoder.matches(rawPassword, storedPassword)
                        || Objects.equals(storedPassword, rawPassword)
        );

        if (!matches) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }
}
