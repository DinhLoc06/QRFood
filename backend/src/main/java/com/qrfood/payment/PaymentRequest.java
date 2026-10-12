package com.qrfood.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull
    private Long sessionId;

    @NotNull
    private PaymentMethod method;
}
