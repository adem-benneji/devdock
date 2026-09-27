package com.devtools.tools.files;

import com.devtools.tools.ApiException;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.apache.commons.compress.archivers.sevenz.*;
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorOutputStream;
import org.apache.commons.compress.compressors.xz.XZCompressorOutputStream;
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.assertj.core.api.Assertions.*;

class ExtendedFileConversionTests {
    private final FileConversionService service = new FileConversionService();
    private static byte[] utf(String value) { return value.getBytes(StandardCharsets.UTF_8); }
    private byte[] convert(byte[] input, String name, String target) { return service.convert(input, name, target, 0, 0, 90).bytes(); }
    @Test void xmlPreservesAttributesRepeatedChildrenEscapingAndStringValues() throws Exception {
        byte[] xml = utf("<?xml version=\"1.0\"?><catalog label=\"A &amp; B\"><item id=\"001\">Ada &lt;3</item><item id=\"002\">Lin</item><empty/></catalog>");
        var info = service.inspect(xml, "misnamed.bin");
        assertThat(info.format()).isEqualTo("xml");
        assertThat(info.warnings().getFirst()).contains("filename extension");
        byte[] json = convert(xml, "input.xml", "json");
        var data = DataConversions.JSON.readTree(json);
        assertThat(data.at("/catalog/@label").asText()).isEqualTo("A & B");
        assertThat(data.at("/catalog/item/0/@id").asText()).isEqualTo("001");
        assertThat(data.at("/catalog/item/0/#text").asText()).isEqualTo("Ada <3");
        assertThat(data.at("/catalog/empty").asText()).isEmpty();
        byte[] restored = convert(json, "input.json", "xml");
        assertThat(DataConversions.parse(new String(restored, StandardCharsets.UTF_8), "xml")).isEqualTo(data);
        assertThat(service.inspect(restored, "input.xml").outputs()).extracting(FileConversionService.Choice::id).contains("json", "yaml");
    }
    @ParameterizedTest @ValueSource(strings = {
        "<!DOCTYPE x [<!ENTITY secret SYSTEM 'file:///private/tmp/devdock-xml-canary'>]><x>&secret;</x>",
        "<!DOCTYPE x SYSTEM 'http://127.0.0.1:1/must-not-fetch'><x/>",
        "<x xmlns='urn:test'><a/></x>", "<x>before<a/>after</x>",
        "<x><a/><b/><a/></x>", "<x><y></x>", "<x/><y/>"
    }) void unsupportedOrUnsafeXmlFailsWithoutExposingParserDetails(String input) {
        assertThatThrownBy(() -> service.inspect(utf(input), "input.xml")).isInstanceOf(ApiException.class).hasMessageNotContaining("devdock-xml-canary").hasMessageNotContaining("127.0.0.1");
    }
    @Test void xmlBoundsAndUnrepresentableOutputsAreEnforced() {
        assertThatThrownBy(() -> service.inspect(utf("<a>".repeat(65) + "x" + "</a>".repeat(65)), "deep.xml")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.inspect(utf("<root>" + "<a/>".repeat(10001) + "</root>"), "wide.xml")).isInstanceOf(ApiException.class);
        for (String input : List.of("{\"root\":null}", "{\"a\":1,\"b\":2}", "{\"root\":{\"bad key\":1}}", "{\"root\":[]}", "{\"root\":{\"#text\":\"x\",\"child\":\"y\"}}")) {
            assertThat(service.inspect(utf(input), "input.json").outputs()).extracting(FileConversionService.Choice::id).doesNotContain("xml");
            assertThatThrownBy(() -> convert(utf(input), "input.json", "xml")).isInstanceOf(ApiException.class).hasMessageContaining("not available");
        }
    }
    @Test void configurationExportsRoundTripLiteralValuesAndSections() throws Exception {
        String flat = "{\"NAME\":\" Ada \",\"TOKEN\":\"literal ${VALUE} \\\\ path = # ; \\\"quoted\\\"\",\"EMPTY\":\"\"}";
        var expected = DataConversions.JSON.readTree(flat);
        for (String target : List.of("env", "ini")) {
            byte[] output = convert(utf(flat), "input.json", target);
            assertThat(DataConversions.JSON.readTree(convert(output, "input." + target, "json"))).isEqualTo(expected);
        }
        String nested = "{\"name\":\"DevDock\",\"database\":{\"port\":\"55432\",\"enabled\":\"true\"},\"empty\":{}}";
        byte[] ini = convert(utf(nested), "config.json", "ini");
        assertThat(DataConversions.JSON.readTree(convert(ini, "config.ini", "json"))).isEqualTo(DataConversions.JSON.readTree(nested));
        assertThat(service.inspect(utf(nested), "config.json").outputs()).extracting(FileConversionService.Choice::id).doesNotContain("env");
    }
    @ParameterizedTest @ValueSource(strings={"{\"VALUE\":null}", "{\"VALUE\":true}", "{\"VALUE\":123}", "{\"VALUE\":[\"x\"]}", "{\"VALUE\":\"a\\nb\"}", "{\"#key\":\"x\"}"})
    void incompatibleConfigurationsAreNotOffered(String input) {
        assertThat(service.inspect(utf(input), "config.json").outputs()).extracting(FileConversionService.Choice::id).doesNotContain("env", "ini");
    }
    @ParameterizedTest @ValueSource(strings={"zip", "tar", "tgz", "7z", "tbz2", "txz"})
    void archiveMatrixPreservesBinaryFilesUnicodeNamesAndEmptyDirectories(String source) throws Exception {
        var entries = new LinkedHashMap<String, byte[]>();
        entries.put("empty/", new byte[0]); entries.put("folder/λ.txt", utf("hello\n")); entries.put("binary.bin", new byte[]{0, 1, (byte) 255});
        byte[] input = ArchiveConversions.pack(entries, source);
        assertThat(service.inspect(input, "misnamed.bin").format()).isEqualTo(source);
        for (String target : List.of("zip", "tar", "tgz", "7z", "tbz2", "txz")) {
            if (source.equals(target)) continue;
            byte[] output = convert(input, "input." + source, target);
            var actual = ArchiveConversions.unpack(output, target);
            assertThat(actual.keySet()).containsExactlyElementsOf(entries.keySet());
            entries.forEach((key, value) -> assertThat(actual.get(key)).isEqualTo(value));
        }
    }
    @ParameterizedTest @ValueSource(strings={"bz2", "xz"})
    void compressedStreamsExtractExactBytesAndRejectTruncation(String format) throws Exception {
        byte[] original = new byte[]{0, 7, (byte) 255, 1, 10};
        var buffer = new ByteArrayOutputStream();
        try (OutputStream compressor = format.equals("bz2") ? new BZip2CompressorOutputStream(buffer) : new XZCompressorOutputStream(buffer, 1)) { compressor.write(original); }
        byte[] input = buffer.toByteArray();
        var info = service.inspect(input, "wrong.zip");
        assertThat(info.format()).isEqualTo(format);
        assertThat(info.outputs()).extracting(FileConversionService.Choice::id).containsExactly("bin");
        assertThat(convert(input, "input." + format, "bin")).isEqualTo(original);
        assertThatThrownBy(() -> service.inspect(Arrays.copyOf(input, input.length - 4), "input." + format)).isInstanceOf(ApiException.class);
        // Concatenated streams must not silently drop the second payload.
        var joined = new ByteArrayOutputStream(); joined.write(input); joined.write(input);
        assertThat(convert(joined.toByteArray(), "joined." + format, "bin")).isEqualTo(new byte[]{0, 7, (byte)255, 1, 10, 0, 7, (byte)255, 1, 10});
    }
    @Test void sevenZRejectsUnsafeNamesLinksEncryptedAndTruncatedContent() throws Exception {
        for (String path : List.of("../escape", "/absolute", "C:/drive", "folder/../bad", "folder\\bad", "folder//file", "file/")) {
            byte[] archive = sevenEntry(path, 0, null);
            assertThatThrownBy(() -> service.inspect(archive, "input.7z")).isInstanceOf(ApiException.class);
        }
        assertThatThrownBy(() -> service.inspect(sevenEntry("link", (0120777 << 16) | 0x8000, null), "input.7z")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.inspect(sevenEntry("reparse", 0x400, null), "input.7z")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.inspect(sevenEntry("secret", 0, "password".toCharArray()), "input.7z")).isInstanceOf(ApiException.class);
        byte[] valid = sevenEntry("safe.txt", 0, null);
        assertThatThrownBy(() -> service.inspect(Arrays.copyOf(valid, valid.length - 6), "input.7z")).isInstanceOf(ApiException.class);
        for (String source : List.of("zip", "tar", "7z")) {
            byte[] conflict = ArchiveConversions.pack(Map.of("folder", utf("file"), "folder/child", utf("child")), source);
            assertThatThrownBy(() -> service.inspect(conflict, "conflict." + source)).isInstanceOf(ApiException.class).hasMessageContaining("conflict");
        }
    }
    private byte[] sevenEntry(String name, int attributes, char[] password) throws IOException {
        try (var channel = new SeekableInMemoryByteChannel(); var seven = new SevenZOutputFile(channel, password)) {
            var entry = new SevenZArchiveEntry(); entry.setName(name); entry.setWindowsAttributes(attributes); entry.setHasWindowsAttributes(true);
            seven.putArchiveEntry(entry); seven.write(utf("payload")); seven.closeArchiveEntry(); seven.finish();
            return Arrays.copyOf(channel.array(), (int)channel.size());
        }
    }
    @Test void expandedStreamsAndDecoderMemoryAreBounded() throws Exception {
        var output = new ByteArrayOutputStream();
        try (var xz = new XZCompressorOutputStream(output, 1)) { xz.write(new byte[FileSupport.OUTPUT_LIMIT + 1]); }
        assertThatThrownBy(() -> service.inspect(output.toByteArray(), "large.xz")).isInstanceOf(ApiException.class);
        var highDictionary = new ByteArrayOutputStream();
        var options = new org.tukaani.xz.LZMA2Options(1); options.setDictSize(128 * 1024 * 1024);
        try (var xz = new org.tukaani.xz.XZOutputStream(highDictionary, options)) { xz.write(utf("small content")); }
        assertThatThrownBy(() -> service.inspect(highDictionary.toByteArray(), "memory.xz")).isInstanceOf(ApiException.class);
        assertThat(FileSupport.filename("my.bundle.tar.xz", "zip")).isEqualTo("my.bundle.zip");
        assertThat(FileSupport.filename("bundle.tar.bz2", "7z")).isEqualTo("bundle.7z");
    }
}
