package com.mantech.app.controller;

import com.mantech.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Utilidad de desarrollo (reset de contraseña sin auth). NUNCA en producción:
// sólo se registra cuando el perfil "prod" NO está activo.
@Profile("!prod")
@RestController
@RequestMapping("/api/auth/dev")
@RequiredArgsConstructor
public class DevAuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public static class ResetRequest {
        public String email;
        public String password;
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetRequest req) {
        return userRepository.findByEmail(req.email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(req.password));
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("status", "ok", "email", req.email));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "user not found")));
    }
}
