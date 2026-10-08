package com.qrfood.table;

import com.qrfood.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TableController {
    private final TableService tableService;

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> listTables() {
        List<TableResponse> response = tableService.findAll().stream()
                .map(table -> TableResponse.builder()
                        .id(table.getId())
                        .tableNumber(table.getTableNumber())
                        .capacity(table.getCapacity())
                        .status(table.getStatus().name())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/tables/available")
    public ResponseEntity<ApiResponse<List<TableResponse>>> listAvailableTables() {
        List<TableResponse> response = tableService.findAvailable().stream()
                .map(table -> TableResponse.builder()
                        .id(table.getId())
                        .tableNumber(table.getTableNumber())
                        .capacity(table.getCapacity())
                        .status(table.getStatus().name())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/tables")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest request) {
        DiningTable table = tableService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Table created", TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus().name())
                .build()));
    }
}
