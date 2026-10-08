package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
}
