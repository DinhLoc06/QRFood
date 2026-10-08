package com.qrfood.session;

import com.qrfood.common.error.BusinessException;
import com.qrfood.common.error.ErrorCode;
import com.qrfood.order.Order;
import com.qrfood.order.OrderStatus;
import com.qrfood.table.DiningTable;
import com.qrfood.table.TableService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;
    private final TableService tableService;

    @Transactional
    public DiningSession createSession(Integer numberOfPeople) {
        if (numberOfPeople == null || numberOfPeople <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Number of people must be positive", HttpStatus.BAD_REQUEST);
        }

        DiningTable table = tableService.assignForPeople(numberOfPeople);
        DiningSession session = DiningSession.builder()
                .table(table)
                .numberOfPeople(numberOfPeople)
                .status(SessionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .build();
        return sessionRepository.save(session);
    }

    public DiningSession findById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SESSION_NOT_FOUND, "Session not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public DiningSession closeSession(Long sessionId) {
        DiningSession session = findById(sessionId);

        for (Order order : session.getOrders()) {
            if (order.getStatus() != OrderStatus.COMPLETED && order.getStatus() != OrderStatus.CANCELLED) {
                throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS, "All related orders must be completed before closing the session", HttpStatus.BAD_REQUEST);
            }
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        tableService.release(session.getTable().getId());
        return sessionRepository.save(session);
    }
}
