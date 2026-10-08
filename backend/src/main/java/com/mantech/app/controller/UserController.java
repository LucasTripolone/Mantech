package com.mantech.app.controller;

import com.mantech.app.dto.UserSummaryResponse;
import com.mantech.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // GET /api/users/technicians — técnicos de mantenimiento (para asignar)
    @GetMapping("/technicians")
    public ResponseEntity<List<UserSummaryResponse>> technicians() {
        List<UserSummaryResponse> techs = userRepository.findByRole_NameOrderByFirstNameAsc("MANTENIMIENTO")
                .stream()
                .map(u -> UserSummaryResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFirstName() + " " + u.getLastName())
                        .email(u.getEmail())
                        .role(u.getRole().getName())
                        .build())
                .toList();
        return ResponseEntity.ok(techs);
    }
}
