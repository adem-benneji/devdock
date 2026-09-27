package com.devtools.tools.files;

import java.io.*;
import java.util.*;
import java.util.zip.*;
import org.apache.commons.compress.archivers.tar.*;
import org.apache.commons.compress.archivers.sevenz.*;
import org.apache.commons.compress.compressors.bzip2.*;
import org.apache.commons.compress.compressors.xz.*;
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel;
import java.nio.ByteBuffer;

final class ArchiveConversions {
    static Map<String, byte[]> unpack(byte[] bytes, String format) throws IOException {
        Map<String, byte[]> result = new LinkedHashMap<>();
        InputStream input = new ByteArrayInputStream(bytes);
        if (Set.of("tgz", "tbz2", "txz").contains(format)) input = decompressor(input, switch (format) { case "tgz" -> "gz"; case "tbz2" -> "bz2"; default -> "xz"; });
        int total = 0;
        if (format.equals("zip")) {
            try (var channel = new org.apache.commons.compress.utils.SeekableInMemoryByteChannel(bytes);
                 var zip = org.apache.commons.compress.archivers.zip.ZipFile.builder().setSeekableByteChannel(channel).get()) {
                var iterator = zip.getEntries();
                while (iterator.hasMoreElements()) {
                    var entry = iterator.nextElement();
                    if (entry.isUnixSymlink() || !zip.canReadEntryData(entry)) throw FileSupport.invalid("Encrypted entries, links, and unsupported archive methods cannot be converted.");
                    checkName(entry.getName(), result);
                    if (entry.getSize() < 0 || entry.getSize() > FileSupport.OUTPUT_LIMIT - total) throw FileSupport.invalid("The expanded archive exceeds the 20 MB limit.");
                    byte[] content;
                    try (var stream = zip.getInputStream(entry)) { content = FileSupport.read(stream, FileSupport.OUTPUT_LIMIT - total); }
                    var crc = new CRC32(); crc.update(content);
                    if (content.length != entry.getSize() || crc.getValue() != entry.getCrc()) throw FileSupport.invalid("An archive entry is truncated or has an invalid checksum.");
                    if (entry.isDirectory() && content.length != 0) throw FileSupport.invalid("Archive directories cannot contain file data.");
                    total += content.length;
                    result.put(entry.getName(), content);
                }
            }
        } else if (format.equals("7z")) {
            try (var channel = new SeekableInMemoryByteChannel(bytes);
                 var seven = SevenZFile.builder().setSeekableByteChannel(channel).setMaxMemoryLimitKiB(65_536).get()) {
                SevenZArchiveEntry entry;
                while ((entry = seven.getNextEntry()) != null) {
                    int attributes = entry.getHasWindowsAttributes() ? entry.getWindowsAttributes() : 0;
                    int unixType = (attributes >>> 16) & 0170000;
                    if (entry.isAntiItem() || (attributes & 0x400) != 0 || (unixType != 0 && unixType != 0100000 && unixType != 0040000)) throw FileSupport.invalid("7Z links, special files, and deletion entries are not supported.");
                    String name = entry.getName();
                    if (!entry.isDirectory() && name != null && name.endsWith("/")) throw FileSupport.invalid("An archive file cannot use a directory path.");
                    if (entry.isDirectory() && name != null && !name.endsWith("/")) name += "/";
                    checkName(name, result);
                    if (entry.getSize() < 0 || entry.getSize() > FileSupport.OUTPUT_LIMIT - total) throw FileSupport.invalid("The expanded archive exceeds the 20 MB limit.");
                    var content = new FileSupport.Output(); byte[] buffer = new byte[8192]; int read;
                    var crc = new CRC32();
                    while ((read = seven.read(buffer)) != -1) {
                        if (read > FileSupport.OUTPUT_LIMIT - total) throw FileSupport.invalid("The expanded archive exceeds the 20 MB limit.");
                        total += read; content.write(buffer, 0, read); crc.update(buffer, 0, read);
                    }
                    if (content.size() != entry.getSize() || (entry.getHasCrc() && crc.getValue() != entry.getCrcValue())) throw FileSupport.invalid("A 7Z entry is truncated or has an invalid checksum.");
                    if (entry.isDirectory() && content.size() != 0) throw FileSupport.invalid("Archive directories cannot contain file data.");
                    result.put(name, content.toByteArray());
                }
            }
        } else {
            try (var tar = new TarArchiveInputStream(input)) {
                TarArchiveEntry entry;
                while ((entry = tar.getNextEntry()) != null) {
                    if (!entry.isCheckSumOK() || (!entry.isFile() && !entry.isDirectory()) || entry.isSparse()) throw FileSupport.invalid("Archives with links, sparse files, or invalid headers are not supported.");
                    checkName(entry.getName(), result);
                    if (entry.getSize() > FileSupport.OUTPUT_LIMIT - total || (entry.isDirectory() && entry.getSize() != 0)) throw FileSupport.invalid("The archive contains oversized entries or directory data.");
                    byte[] content = FileSupport.read(tar, FileSupport.OUTPUT_LIMIT - total);
                    total += content.length;
                    result.put(entry.getName(), content);
                }
            }
        }
        if (result.isEmpty()) throw FileSupport.invalid("The archive is empty or could not be read.");
        return result;
    }
    static void checkName(String name, Map<String, byte[]> entries) {
        if (name == null) throw FileSupport.invalid("Archive entries must have names.");
        if (entries.size() >= 200 || name.length() > 240) throw FileSupport.invalid("Use archives with at most 200 entries and short entry names.");
        if (name.isBlank() || name.startsWith("/") || name.contains("\\") || name.contains(":") || name.codePoints().anyMatch(c -> c < 32) || Arrays.stream(name.split("/", -1)).anyMatch(p -> p.equals("..") || p.equals("."))) throw FileSupport.invalid("This archive contains an unsafe entry path.");
        if (entries.containsKey(name)) throw FileSupport.invalid("Archive entries must have unique names.");
        String path = name.endsWith("/") ? name.substring(0, name.length() - 1) : name;
        if (Arrays.stream(path.split("/", -1)).anyMatch(String::isEmpty)) throw FileSupport.invalid("Archive paths cannot contain empty segments.");
        for (String existing : entries.keySet()) {
            String other = existing.endsWith("/") ? existing.substring(0, existing.length() - 1) : existing;
            if (path.equals(other) || (!existing.endsWith("/") && path.startsWith(other + "/")) || (!name.endsWith("/") && other.startsWith(path + "/")))
                throw FileSupport.invalid("Archive file and directory paths conflict.");
        }
    }
    static byte[] expand(byte[] bytes, String format) throws IOException {
        try (var stream = decompressor(new ByteArrayInputStream(bytes), format)) { return FileSupport.read(stream, FileSupport.OUTPUT_LIMIT); }
    }
    private static InputStream decompressor(InputStream input, String format) throws IOException {
        return switch (format) {
            case "gz" -> new GZIPInputStream(input);
            case "bz2" -> new BZip2CompressorInputStream(input, true);
            case "xz" -> XZCompressorInputStream.builder().setInputStream(input).setDecompressConcatenated(true).setMemoryLimitKiB(65_536).get();
            default -> throw FileSupport.unsupported("Unknown compression format.");
        };
    }
    private static final class BoundedChannel extends SeekableInMemoryByteChannel {
        @Override public int write(ByteBuffer source) throws IOException {
            if (position() + source.remaining() > FileSupport.OUTPUT_LIMIT) throw FileSupport.invalid("The converted archive exceeds the 20 MB limit.");
            return super.write(source);
        }
    }
    static byte[] pack(Map<String, byte[]> entries, String target) throws IOException {
        var output = new FileSupport.Output();
        if (target.equals("zip")) {
            try (var zip = new ZipOutputStream(output)) {
                for (var item : entries.entrySet()) { zip.putNextEntry(new ZipEntry(item.getKey())); zip.write(item.getValue()); zip.closeEntry(); }
            }
        } else if (target.equals("7z")) {
            try (var channel = new BoundedChannel(); var seven = new SevenZOutputFile(channel)) {
                // Preset 1 bounds encoder memory and keeps small interactive conversions responsive.
                seven.setContentMethods(List.of(new SevenZMethodConfiguration(SevenZMethod.LZMA2, new org.tukaani.xz.LZMA2Options(1))));
                for (var item : entries.entrySet()) {
                    var entry = new SevenZArchiveEntry(); entry.setName(item.getKey()); entry.setDirectory(item.getKey().endsWith("/")); entry.setSize(item.getValue().length);
                    seven.putArchiveEntry(entry); seven.write(item.getValue()); seven.closeArchiveEntry();
                }
                seven.finish();
                return Arrays.copyOf(channel.array(), (int) channel.size());
            }
        } else {
            OutputStream sink = switch (target) {
                case "tgz" -> new GZIPOutputStream(output);
                case "tbz2" -> new BZip2CompressorOutputStream(output, 1);
                case "txz" -> new XZCompressorOutputStream(output, 1);
                case "tar" -> output;
                default -> throw FileSupport.unsupported("Choose an available archive output.");
            };
            try (var tar = new TarArchiveOutputStream(sink)) {
                tar.setLongFileMode(TarArchiveOutputStream.LONGFILE_POSIX);
                for (var item : entries.entrySet()) { var entry = new TarArchiveEntry(item.getKey()); entry.setSize(item.getValue().length); tar.putArchiveEntry(entry); tar.write(item.getValue()); tar.closeArchiveEntry(); }
            }
        }
        return output.toByteArray();
    }
}
