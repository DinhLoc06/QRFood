package com.qrfood.table;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TableRequest {
    @NotBlank
    private String tableNumber;

    @Min(1)
    private Integer capacity;

    private TableStatus status = TableStatus.AVAILABLE;
}
