package com.qrfood.session;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class SessionRequest {
    @Min(1)
    private Integer numberOfPeople;
}
