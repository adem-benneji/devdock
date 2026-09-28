package com.devtools.gatewayservice;

import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferLimitException;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@Order(-1)
public class ApiRequestFilter implements WebFilter {
  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    if (!exchange.getRequest().getPath().value().startsWith("/api/")) return chain.filter(exchange);
    exchange.getResponse().getHeaders().setCacheControl("no-store");
    // Bound bytes even for chunked bodies before proxying; no payload logging or storage.
    return DataBufferUtils.join(exchange.getRequest().getBody(), 8_000_000)
        .map(
            buffer -> {
              byte[] body = new byte[buffer.readableByteCount()];
              buffer.read(body);
              DataBufferUtils.release(buffer);
              return body;
            })
        .defaultIfEmpty(new byte[0])
        .flatMap(
            body ->
                chain.filter(
                    exchange
                        .mutate()
                        .request(
                            new ServerHttpRequestDecorator(exchange.getRequest()) {
                              @Override
                              public Flux<DataBuffer> getBody() {
                                return Flux.defer(
                                    () ->
                                        Flux.just(
                                            exchange.getResponse().bufferFactory().wrap(body)));
                              }
                            })
                        .build()))
        .onErrorMap(
            DataBufferLimitException.class,
            ex -> new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE));
  }
}
