package com.devtools.tools.files;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.fasterxml.jackson.dataformat.yaml.*;
import com.fasterxml.jackson.dataformat.toml.TomlMapper;
import org.yaml.snakeyaml.LoaderOptions;
import org.apache.commons.csv.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

final class DataConversions {
    static final ObjectMapper JSON = configured(new ObjectMapper());
    static final ObjectMapper YAML;
    static final ObjectMapper TOML = configured(new TomlMapper());
    static {
        LoaderOptions options = new LoaderOptions(); options.setMaxAliasesForCollections(0); options.setNestingDepthLimit(64); options.setCodePointLimit(FileSupport.TEXT_LIMIT); options.setAllowDuplicateKeys(false);
        YAML = configured(new ObjectMapper(YAMLFactory.builder().loaderOptions(options).enable(YAMLParser.Feature.PARSE_BOOLEAN_LIKE_WORDS_AS_STRINGS).build()));
    }
    static ObjectMapper configured(ObjectMapper mapper) {
        mapper.enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS, DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, DeserializationFeature.USE_BIG_INTEGER_FOR_INTS);
        mapper.enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
        mapper.getFactory().setStreamReadConstraints(StreamReadConstraints.builder().maxNestingDepth(64).maxStringLength(FileSupport.TEXT_LIMIT).maxNumberLength(1000).build());
        return mapper;
    }
    static JsonNode parse(String text, String format) throws IOException {
        JsonNode node = switch (format) {
            case "json" -> JSON.readTree(text);
            case "yaml" -> { checkYaml(text); yield YAML.readTree(text); }
            case "toml" -> TOML.readTree(text);
            case "csv", "tsv" -> fromTable(table(text, format.equals("tsv") ? '\t' : ','));
            case "env", "ini" -> properties(text, format);
            case "xml" -> { try { yield XmlConversions.parse(text); } catch (javax.xml.stream.XMLStreamException e) { throw FileSupport.invalid("This XML is malformed or contains unsupported declarations."); } }
            default -> throw FileSupport.unsupported("This data format is not supported yet.");
        };
        if (node == null || node.isMissingNode()) throw FileSupport.invalid("The file does not contain a data value.");
        checkValues(node, 0);
        return node;
    }
    static void checkYaml(String text) {
        var options = new LoaderOptions(); options.setCodePointLimit(FileSupport.TEXT_LIMIT); options.setNestingDepthLimit(64); options.setMaxAliasesForCollections(0);
        for (var event : new org.yaml.snakeyaml.Yaml(options).parse(new StringReader(text))) {
            if (event instanceof org.yaml.snakeyaml.events.AliasEvent) throw FileSupport.invalid("YAML aliases are not supported. Expand referenced values first.");
            String tag = event instanceof org.yaml.snakeyaml.events.ScalarEvent scalar ? scalar.getTag() : event instanceof org.yaml.snakeyaml.events.CollectionStartEvent collection ? collection.getTag() : null;
            if (tag != null && !Set.of("tag:yaml.org,2002:str", "tag:yaml.org,2002:int", "tag:yaml.org,2002:float", "tag:yaml.org,2002:bool", "tag:yaml.org,2002:null", "tag:yaml.org,2002:map", "tag:yaml.org,2002:seq").contains(tag)) throw FileSupport.invalid("Custom YAML tags are not supported.");
        }
    }
    static void checkValues(JsonNode node, int depth) {
        if (depth > 64) throw FileSupport.invalid("Data may be nested at most 64 levels deep.");
        if (node.isFloatingPointNumber() && !Double.isFinite(node.doubleValue())) throw FileSupport.invalid("Nonfinite numeric values are not supported.");
        for (JsonNode child : node) checkValues(child, depth + 1);
    }
    static List<List<String>> table(String text, char delimiter) throws IOException {
        var rows = new ArrayList<List<String>>();
        try (var parser = CSVFormat.RFC4180.builder().setDelimiter(delimiter).get().parse(new StringReader(text))) {
            for (CSVRecord record : parser) {
                if (rows.size() >= 5001 || record.size() > 100) throw FileSupport.invalid("Use at most 5,000 data rows and 100 columns.");
                rows.add(record.toList());
            }
        }
        validateTable(rows); return rows;
    }
    static void validateTable(List<List<String>> rows) {
        if (rows.isEmpty() || rows.getFirst().isEmpty() || rows.getFirst().stream().anyMatch(String::isBlank) || new HashSet<>(rows.getFirst()).size() != rows.getFirst().size()) throw FileSupport.invalid("Table headers must be nonblank and unique.");
        for (var row : rows) if (row.size() != rows.getFirst().size()) throw FileSupport.invalid("Every table row must have the same number of columns.");
    }
    static JsonNode fromTable(List<List<String>> rows) {
        validateTable(rows); var array = JSON.createArrayNode(); var headers = rows.getFirst();
        for (var row : rows.subList(1, rows.size())) { var obj = array.addObject(); for (int i = 0; i < headers.size(); i++) obj.put(headers.get(i), row.get(i)); }
        return array;
    }
    static List<List<String>> toTable(JsonNode data) {
        if (!data.isArray() || data.isEmpty() || data.size() > 5000) throw FileSupport.invalid("Spreadsheet output needs a nonempty array of up to 5,000 flat records.");
        var columns = new LinkedHashSet<String>();
        for (JsonNode row : data) {
            if (!row.isObject()) throw FileSupport.invalid("Spreadsheet output needs flat objects.");
            row.fieldNames().forEachRemaining(columns::add);
            for (JsonNode value : row) if (value.isContainerNode()) throw FileSupport.invalid("Nested values cannot be converted to spreadsheet cells.");
        }
        if (columns.isEmpty() || columns.size() > 100 || columns.stream().anyMatch(String::isBlank)) throw FileSupport.invalid("Use 1–100 nonblank table column names.");
        List<List<String>> rows = new ArrayList<>(); rows.add(new ArrayList<>(columns));
        for (JsonNode row : data) rows.add(columns.stream().map(key -> row.path(key).isMissingNode() || row.path(key).isNull() ? "" : row.path(key).asText()).toList());
        return rows;
    }
    static JsonNode properties(String text, String format) {
        ObjectNode root = JSON.createObjectNode(), current = root;
        for (String line : text.split("\\R")) {
            line = line.trim(); if (line.isEmpty() || line.startsWith("#") || (format.equals("ini") && line.startsWith(";"))) continue;
            if (format.equals("ini") && line.matches("\\[[^\\[\\]]+\\]")) {
                String section = line.substring(1, line.length() - 1).trim();
                if (root.has(section)) throw FileSupport.invalid("INI sections and keys must be unique.");
                current = root.putObject(section); continue;
            }
            if (format.equals("env") && line.startsWith("export ")) line = line.substring(7).trim();
            int equals = line.indexOf('=');
            if (equals < 1) throw FileSupport.invalid("Expected one key=value assignment per line.");
            String key = line.substring(0, equals).trim(), value = line.substring(equals + 1).trim();
            if (format.equals("env") && !key.matches("[A-Za-z_][A-Za-z0-9_]*")) throw FileSupport.invalid("ENV keys must be letters, digits, or underscores and cannot start with a digit.");
            if (current.has(key)) throw FileSupport.invalid("Configuration keys must be unique.");
            if (value.startsWith("\"") || value.startsWith("'")) {
                if (value.length() < 2 || value.charAt(value.length()-1) != value.charAt(0)) throw FileSupport.invalid("Quoted values must end on the same line.");
                value = value.substring(1, value.length()-1);
            }
            current.put(key, value);
        }
        if (root.isEmpty()) throw FileSupport.invalid("No configuration assignments were found.");
        return root;
    }
    static List<String> sheets(byte[] bytes) throws IOException {
        try (Workbook book = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            if (book.getNumberOfSheets() > 50) throw FileSupport.invalid("Workbooks may contain at most 50 sheets.");
            var names = new ArrayList<String>(); for (Sheet sheet : book) names.add(sheet.getSheetName()); return names;
        }
    }
    static JsonNode workbook(byte[] bytes, int sheetIndex) throws IOException {
        try (Workbook book = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            if (sheetIndex < 0 || sheetIndex >= book.getNumberOfSheets()) throw FileSupport.invalid("Choose a sheet present in this workbook.");
            Sheet sheet = book.getSheetAt(sheetIndex); var rows = new ArrayList<List<String>>();
            if (sheet.getLastRowNum() > 5000) throw FileSupport.invalid("Use sheets with at most 5,000 data rows.");
            DataFormatter formatter = new DataFormatter(Locale.ROOT); formatter.setUseCachedValuesForFormulaCells(true);
            Row header = sheet.getRow(0); int width = header == null ? 0 : header.getLastCellNum();
            if (width < 1 || width > 100) throw FileSupport.invalid("The first sheet row needs 1–100 column headers.");
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i); if (row != null && row.getLastCellNum() > width) throw FileSupport.invalid("A row contains values beyond the header columns.");
                var values = new ArrayList<String>(); for (int c = 0; c < width; c++) values.add(row == null ? "" : formatter.formatCellValue(row.getCell(c)));
                rows.add(values);
            }
            return fromTable(rows);
        }
    }
    static byte[] write(JsonNode data, String target) throws IOException {
        var output = new FileSupport.Output();
        if (target.equals("xml")) {
            try { return XmlConversions.write(data); } catch (javax.xml.stream.XMLStreamException e) { throw FileSupport.invalid("This data cannot be represented as XML."); }
        } else if (target.equals("env") || target.equals("ini")) {
            return writeProperties(data, target);
        } else if (target.equals("xlsx")) {
            try (Workbook book = new XSSFWorkbook()) {
                Sheet sheet = book.createSheet("Converted"); int index = 0;
                for (var values : toTable(data)) { Row row = sheet.createRow(index++); for (int c = 0; c < values.size(); c++) { if (values.get(c).length() > 32767) throw FileSupport.invalid("Spreadsheet cells must be at most 32,767 characters."); row.createCell(c, CellType.STRING).setCellValue(values.get(c)); } }
                book.write(output);
            }
        } else if (target.equals("csv") || target.equals("tsv")) {
            try (var writer = new OutputStreamWriter(output, StandardCharsets.UTF_8); var csv = new CSVPrinter(writer, CSVFormat.RFC4180.builder().setDelimiter(target.equals("tsv") ? '\t' : ',').get())) {
                for (var row : toTable(data)) csv.printRecord(row.stream().map(value -> value.matches("(?s)^[=+\\-@\\t\\r].*") ? "'" + value : value).toList());
            }
        } else {
            ObjectMapper mapper = switch (target) { case "json" -> JSON; case "yaml" -> YAML; case "toml" -> TOML; default -> throw FileSupport.unsupported("Choose an available data output."); };
            mapper.writerWithDefaultPrettyPrinter().writeValue(output, data);
        }
        return output.toByteArray();
    }
    private static byte[] writeProperties(JsonNode data, String format) {
        if (!data.isObject() || data.isEmpty()) throw FileSupport.invalid("Configuration output needs a nonempty object of string values.");
        var result = new StringBuilder();
        var fields = data.fields();
        while (fields.hasNext()) { var field = fields.next(); if (!field.getValue().isObject()) assignment(result, field.getKey(), field.getValue(), format); }
        fields = data.fields();
        while (fields.hasNext()) {
            var field = fields.next();
            if (!field.getValue().isObject()) continue;
            if (!format.equals("ini")) throw FileSupport.invalid("ENV output requires a flat object of string values.");
            String key = field.getKey();
            if (key.isBlank() || !key.equals(key.trim()) || key.matches("(?s).*[\\[\\]\\r\\n].*")) throw FileSupport.invalid("This INI section name cannot be exported.");
            result.append('\n').append('[').append(key).append("]\n");
            var entries = field.getValue().fields();
            while (entries.hasNext()) { var entry = entries.next(); assignment(result, entry.getKey(), entry.getValue(), format); }
        }
        // Keep the writer's dialect aligned with the actual parser, including section/key collisions.
        if (!properties(result.toString(), format).equals(data)) throw FileSupport.invalid("This data cannot be exported without changing its configuration values.");
        byte[] bytes = result.toString().getBytes(StandardCharsets.UTF_8);
        if (bytes.length > FileSupport.TEXT_LIMIT) throw FileSupport.invalid("Configuration output must be at most 500 KB.");
        return bytes;
    }
    private static void assignment(StringBuilder output, String key, JsonNode value, String format) {
        if (!value.isTextual() || value.asText().matches("(?s).*[\\r\\n\\u0085\\u2028\\u2029].*")) throw FileSupport.invalid("Configuration values must be single-line strings; arrays, numbers, booleans, and null must be converted to strings first.");
        if (key.isBlank() || !key.equals(key.trim()) || key.matches("(?s).*[=\\r\\n].*") || key.startsWith("#") || key.startsWith(";") || key.startsWith("[") || (format.equals("env") && !key.matches("[A-Za-z_][A-Za-z0-9_]*"))) throw FileSupport.invalid("This key cannot be represented in the selected configuration format.");
        String text = value.asText();
        char quote = text.indexOf('\'') < 0 ? '\'' : '"';
        if (text.indexOf(quote) >= 0) throw FileSupport.invalid("Values containing both quote styles cannot be exported in the literal configuration dialect.");
        output.append(key).append('=').append(quote).append(text).append(quote).append('\n');
    }
}
