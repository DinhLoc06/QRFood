package com.qrfood.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long sessionId;

    private String note;

    @Valid
    @NotNull
    private List<OrderItemRequest> items;
}
