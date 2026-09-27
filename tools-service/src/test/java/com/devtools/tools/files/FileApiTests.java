package com.devtools.tools.files;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class FileApiTests {
    @Autowired TestRestTemplate http;
    private HttpEntity<byte[]> upload(String text) {var headers=new HttpHeaders();headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);return new HttpEntity<>(text.getBytes(StandardCharsets.UTF_8),headers);}
    @Test void capabilityInspectionAndDownloadContractsUseRealConversion() {
        var caps=http.getForObject("/api/tools/files/capabilities",FileConversionService.Capabilities.class);assertThat(caps.maxInputBytes()).isEqualTo(5_000_000);assertThat(caps.sections()).hasSize(9);
        var inspect=http.postForEntity("/api/tools/files/inspect?filename=users.json",upload("[{\"name\":\"Ada\"}]"),FileConversionService.Inspection.class);
        assertThat(inspect.getStatusCode()).isEqualTo(HttpStatus.OK);assertThat(inspect.getBody().format()).isEqualTo("json");
        var download=http.postForEntity("/api/tools/files/convert?filename=users.json&target=csv",upload("[{\"name\":\"Ada\"}]"),byte[].class);
        assertThat(download.getStatusCode()).isEqualTo(HttpStatus.OK);assertThat(new String(download.getBody(),StandardCharsets.UTF_8)).contains("name\r\nAda");
        assertThat(download.getHeaders().getFirst("Content-Disposition")).contains("attachment","users.csv");assertThat(download.getHeaders().getCacheControl()).isEqualTo("no-store");assertThat(download.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
    }
    @Test void errorContractRejectsInvalidPairsMissingParametersAndWrongMediaType() {
        var invalid=http.postForEntity("/api/tools/files/convert?target=mp3&filename=data.json",upload("{}"),String.class);assertThat(invalid.getStatusCode().value()).isEqualTo(422);assertThat(invalid.getBody()).contains("UNSUPPORTED_CONVERSION").doesNotContain("stackTrace");
        assertThat(http.postForEntity("/api/tools/files/convert",upload("{}"),String.class).getStatusCode().value()).isEqualTo(400);
        assertThat(http.postForEntity("/api/tools/files/inspect", java.util.Map.of("content","secret"),String.class).getStatusCode().value()).isEqualTo(415);
        var large=http.postForEntity("/api/tools/files/inspect",new HttpEntity<>(new byte[5_000_001],upload("").getHeaders()),String.class);assertThat(large.getStatusCode().value()).isEqualTo(413);
    }
    @Test void xmlAndArchiveHttpContractsRejectExternalResourcesAndReturnCorrectDownloads() throws Exception {
        var hits = new java.util.concurrent.atomic.AtomicInteger();
        var external = com.sun.net.httpserver.HttpServer.create(new java.net.InetSocketAddress("127.0.0.1", 0), 0);
        external.createContext("/resource", exchange -> { hits.incrementAndGet(); exchange.sendResponseHeaders(200, 0); exchange.close(); });
        external.start();
        try {
            String xml = "<!DOCTYPE root SYSTEM 'http://127.0.0.1:" + external.getAddress().getPort() + "/resource'><root/>";
            var rejected = http.postForEntity("/api/tools/files/inspect?filename=input.xml", upload(xml), String.class);
            assertThat(rejected.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(rejected.getBody()).contains("INVALID_FILE").doesNotContain("127.0.0.1", "stackTrace");
            assertThat(hits.get()).isZero();
        } finally { external.stop(0); }
        var xml = http.postForEntity("/api/tools/files/convert?filename=input.json&target=xml", upload("{\"root\":{\"name\":\"Ada\"}}"), byte[].class);
        assertThat(xml.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(xml.getHeaders().getContentType().toString()).isEqualTo("application/xml");
        assertThat(new String(xml.getBody(), StandardCharsets.UTF_8)).contains("<name>Ada</name>");
        byte[] zip = ArchiveConversions.pack(java.util.Map.of("data.txt", new byte[]{1, 2, 3}), "zip");
        var seven = http.postForEntity("/api/tools/files/convert?filename=input.zip&target=7z", new HttpEntity<>(zip, upload("").getHeaders()), byte[].class);
        assertThat(seven.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(seven.getHeaders().getContentType().toString()).isEqualTo("application/x-7z-compressed");
        assertThat(seven.getHeaders().getFirst("Content-Disposition")).contains("input.7z");
        assertThat(ArchiveConversions.unpack(seven.getBody(), "7z").get("data.txt")).isEqualTo(new byte[]{1, 2, 3});
    }
}
