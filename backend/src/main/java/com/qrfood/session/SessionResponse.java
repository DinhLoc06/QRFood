package com.qrfood.session;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private String tableNumber;
    private Integer numberOfPeople;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}
