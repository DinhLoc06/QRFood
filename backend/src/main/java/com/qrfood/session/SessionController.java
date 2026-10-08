package com.qrfood.session;

import com.qrfood.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(@Valid @RequestBody SessionRequest request) {
        DiningSession session = sessionService.createSession(request.getNumberOfPeople());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Session created", SessionResponse.builder()
                .id(session.getId())
                .tableNumber(session.getTable().getTableNumber())
                .numberOfPeople(session.getNumberOfPeople())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .build()));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(@PathVariable Long id) {
        DiningSession session = sessionService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(SessionResponse.builder()
                .id(session.getId())
                .tableNumber(session.getTable().getTableNumber())
                .numberOfPeople(session.getNumberOfPeople())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .build()));
    }

    @PostMapping("/sessions/{id}/close")
    public ResponseEntity<ApiResponse<SessionResponse>> closeSession(@PathVariable Long id) {
        DiningSession session = sessionService.closeSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session closed", SessionResponse.builder()
                .id(session.getId())
                .tableNumber(session.getTable().getTableNumber())
                .numberOfPeople(session.getNumberOfPeople())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .build()));
    }
}
