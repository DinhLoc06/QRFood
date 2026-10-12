package com.qrfood.payment;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long sessionId;
    private String tableNumber;
    private BigDecimal amount;
    private String method;
    private String status;
    private String referenceCode;
    private String qrContent;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
