package com.qrfood.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long sessionId;
    private String status;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private String rejectedReason;
    private List<OrderItemResponse> items;
}
