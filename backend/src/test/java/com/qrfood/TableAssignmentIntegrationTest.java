package com.qrfood;

import com.qrfood.common.error.BusinessException;
import com.qrfood.session.DiningSession;
import com.qrfood.session.SessionRepository;
import com.qrfood.session.SessionService;
import com.qrfood.table.DiningTable;
import com.qrfood.table.TableRepository;
import com.qrfood.table.TableService;
import com.qrfood.table.TableStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class TableAssignmentIntegrationTest {

    @Autowired
    private TableService tableService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Test
    void shouldAssignSmallestAvailableTable() {
        sessionRepository.deleteAll();
        tableRepository.deleteAll();
        tableRepository.save(DiningTable.builder().tableNumber("A01").capacity(2).status(TableStatus.AVAILABLE).build());
        tableRepository.save(DiningTable.builder().tableNumber("A02").capacity(4).status(TableStatus.AVAILABLE).build());
        tableRepository.save(DiningTable.builder().tableNumber("A03").capacity(6).status(TableStatus.AVAILABLE).build());

        DiningTable assigned = tableService.assignForPeople(4);

        assertEquals("A02", assigned.getTableNumber());
        assertEquals(TableStatus.OCCUPIED, assigned.getStatus());
    }

    @Test
    void shouldPreventConcurrentAssignmentsForSameTable() throws InterruptedException {
        sessionRepository.deleteAll();
        tableRepository.deleteAll();
        tableRepository.save(DiningTable.builder().tableNumber("A02").capacity(4).status(TableStatus.AVAILABLE).build());

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger();

        for (int i = 0; i < 2; i++) {
            executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    DiningSession session = sessionService.createSession(4);
                    successCount.incrementAndGet();
                    assertNotNull(session);
                } catch (BusinessException ex) {
                    assertEquals("NO_TABLE_AVAILABLE", ex.getCode().name());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    fail(e);
                }
            });
        }

        ready.await();
        start.countDown();
        executor.shutdown();
        assertTrue(executor.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS));
        assertEquals(1, successCount.get());
    }
}
