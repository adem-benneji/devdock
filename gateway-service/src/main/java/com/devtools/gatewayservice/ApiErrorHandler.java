package com.devtools.gatewayservice;

import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Order(-2)
public class ApiErrorHandler implements ErrorWebExceptionHandler {
    private final ObjectMapper mapper;
    public ApiErrorHandler(ObjectMapper mapper) { this.mapper = mapper; }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable failure) {
        if (exchange.getResponse().isCommitted()) return Mono.error(failure);
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String code = "INTERNAL_ERROR";
        String message = "The gateway could not complete the request.";
        for (Throwable cause = failure; cause != null; cause = cause.getCause()) {
            if (cause instanceof java.net.ConnectException || cause instanceof java.net.UnknownHostException) {
                status = HttpStatus.SERVICE_UNAVAILABLE;
                code = "SERVICE_UNAVAILABLE";
                message = "The requested service is unavailable. Try again shortly.";
                break;
            }
            if (cause instanceof java.util.concurrent.TimeoutException || cause instanceof io.netty.handler.timeout.TimeoutException) {
                status = HttpStatus.GATEWAY_TIMEOUT;
                code = "GATEWAY_TIMEOUT";
                message = "The requested service did not respond in time.";
                break;
            }
        }
        if (failure instanceof ResponseStatusException ex) {
            status = HttpStatus.valueOf(ex.getStatusCode().value());
            code = status.name();
            message = status.is4xxClientError() ? status.getReasonPhrase() : "The requested service did not respond in time.";
        }
        try {
            byte[] body = mapper.writeValueAsBytes(Map.of("code", code, "message", message, "fields", Map.of()));
            exchange.getResponse().setStatusCode(status);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
        } catch (Exception ex) { return Mono.error(ex); }
    }
}
