package com.qrfood.qr;

import com.qrfood.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QrController {
    private final QrCodeService qrCodeService;

    @GetMapping("/qr")
    public ResponseEntity<ApiResponse<Map<String, String>>> getQr(@RequestParam(defaultValue = "https://qrfood.com/start") String url) {
        String png = qrCodeService.generatePngBase64(url);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "url", url,
                "imageBase64", png,
                "imageMimeType", "image/png"
        )));
    }
}
