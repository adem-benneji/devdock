package com.devtools.tools.files;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.xml.stream.*;

/** Data XML: one root, @attributes, #text, and repeated child arrays. Never resolves resources. */
final class XmlConversions {
    static JsonNode parse(String text) throws XMLStreamException {
        var factory = XMLInputFactory.newFactory();
        factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        factory.setProperty("javax.xml.stream.isSupportingExternalEntities", false);
        factory.setXMLResolver((publicId, systemId, base, namespace) -> { throw FileSupport.invalid("External XML resources are not allowed."); });
        var reader = factory.createXMLStreamReader(new StringReader(text));
        var stack = new ArrayDeque<Element>();
        ObjectNode root = DataConversions.JSON.createObjectNode(); int count = 0;
        try {
            while (reader.hasNext()) {
                int event = reader.next();
                if (event == XMLStreamConstants.DTD || event == XMLStreamConstants.ENTITY_REFERENCE)
                    throw FileSupport.invalid("XML DTDs and entity declarations are not supported.");
                if (event == XMLStreamConstants.START_ELEMENT) {
                    if (stack.size() >= 64 || ++count > 10_000) throw FileSupport.invalid("Use XML with at most 64 levels and 10,000 elements.");
                    if (reader.getNamespaceCount() > 0 || (reader.getNamespaceURI() != null && !reader.getNamespaceURI().isEmpty()))
                        throw FileSupport.invalid("Namespaced XML is not supported by this data converter.");
                    String name = reader.getLocalName(); checkName(name);
                    var element = new Element(name);
                    for (int i = 0; i < reader.getAttributeCount(); i++) {
                        if (reader.getAttributeNamespace(i) != null && !reader.getAttributeNamespace(i).isEmpty()) throw FileSupport.invalid("Namespaced XML attributes are not supported.");
                        checkName(reader.getAttributeLocalName(i));
                        element.value.put("@" + reader.getAttributeLocalName(i), reader.getAttributeValue(i));
                    }
                    stack.push(element);
                } else if (event == XMLStreamConstants.CHARACTERS || event == XMLStreamConstants.CDATA || event == XMLStreamConstants.SPACE) {
                    if (!stack.isEmpty()) stack.peek().text.append(reader.getText());
                } else if (event == XMLStreamConstants.END_ELEMENT) {
                    Element element = stack.pop(); JsonNode value = element.finish();
                    if (stack.isEmpty()) root.set(element.name, value); else stack.peek().add(element.name, value);
                }
            }
        } finally { reader.close(); }
        if (root.size() != 1) throw FileSupport.invalid("XML must have one root element.");
        return root;
    }
    private static final class Element {
        final String name; final ObjectNode value = DataConversions.JSON.createObjectNode();
        final StringBuilder text = new StringBuilder(); boolean children; String lastChild;
        Element(String name) { this.name = name; }
        void add(String key, JsonNode child) {
            children = true;
            if (value.has(key)) {
                if (!key.equals(lastChild)) throw FileSupport.invalid("Interleaved XML child names cannot be represented without losing their order.");
                JsonNode previous = value.get(key);
                if (previous.isArray()) ((com.fasterxml.jackson.databind.node.ArrayNode) previous).add(child);
                else value.set(key, DataConversions.JSON.createArrayNode().add(previous).add(child));
            } else value.set(key, child);
            lastChild = key;
        }
        JsonNode finish() {
            if (children && !text.toString().isBlank()) throw FileSupport.invalid("Mixed text and child elements are not supported by the data XML converter.");
            if (!children && value.isEmpty()) return DataConversions.JSON.getNodeFactory().textNode(text.toString());
            if (!children && !text.isEmpty()) value.put("#text", text.toString());
            return value;
        }
    }
    static byte[] write(JsonNode data) throws XMLStreamException {
        if (!data.isObject() || data.size() != 1) throw FileSupport.invalid("XML output needs an object with exactly one root element name.");
        var output = new FileSupport.Output();
        var writer = XMLOutputFactory.newFactory().createXMLStreamWriter(output, StandardCharsets.UTF_8.name());
        try {
            writer.writeStartDocument("UTF-8", "1.0");
            var root = data.fields().next();
            if (root.getValue().isArray()) throw FileSupport.invalid("The XML root cannot be an array.");
            element(writer, root.getKey(), root.getValue(), 0);
            writer.writeEndDocument(); writer.flush();
        } finally { writer.close(); }
        byte[] bytes = output.toByteArray();
        // Apply the same structural and size limits to downloads as uploads.
        parse(FileSupport.text(bytes));
        return bytes;
    }
    private static void element(XMLStreamWriter writer, String name, JsonNode node, int depth) throws XMLStreamException {
        if (depth >= 64) throw FileSupport.invalid("XML may be nested at most 64 elements deep.");
        checkName(name);
        if (node.isArray()) {
            if (node.isEmpty()) throw FileSupport.invalid("Empty arrays cannot be represented in XML.");
            for (var item : node) { if (item.isArray()) throw FileSupport.invalid("Nested arrays cannot be represented in XML."); element(writer, name, item, depth); }
            return;
        }
        writer.writeStartElement(name);
        if (node.isObject()) {
            boolean children = false;
            var fields = node.fields();
            while (fields.hasNext()) {
                var field = fields.next(); String key = field.getKey();
                if (key.startsWith("@")) {
                    checkName(key.substring(1)); String value = scalar(field.getValue());
                    if (value.indexOf('\t') >= 0 || value.indexOf('\n') >= 0) throw FileSupport.invalid("XML attribute whitespace would be normalized; use a child element for multiline values.");
                    writer.writeAttribute(key.substring(1), value);
                }
                else if (!key.equals("#text")) children = true;
            }
            if (node.has("#text")) {
                if (children) throw FileSupport.invalid("Mixed XML text and child elements cannot be exported.");
                writer.writeCharacters(scalar(node.get("#text")));
            }
            fields = node.fields();
            while (fields.hasNext()) { var field = fields.next(); if (!field.getKey().startsWith("@") && !field.getKey().equals("#text")) element(writer, field.getKey(), field.getValue(), depth + 1); }
        } else writer.writeCharacters(scalar(node));
        writer.writeEndElement();
    }
    private static String scalar(JsonNode node) {
        if (!node.isValueNode() || node.isNull()) throw FileSupport.invalid("XML values must be strings, numbers, or booleans; null has no implicit XML representation.");
        String value = node.asText();
        if (value.indexOf('\r') >= 0) throw FileSupport.invalid("XML normalizes carriage returns; use LF line endings before export.");
        if (value.codePoints().anyMatch(c -> !(c == 9 || c == 10 || c == 13 || c >= 32 && c <= 0xd7ff || c >= 0xe000 && c <= 0xfffd || c >= 0x10000 && c <= 0x10ffff))) throw FileSupport.invalid("A value contains characters XML cannot represent.");
        return value;
    }
    private static void checkName(String name) {
        if (!name.matches("[A-Za-z_][A-Za-z0-9_.-]*") || name.equals("xmlns")) throw FileSupport.invalid("Use simple XML names without namespaces: letters, digits, underscores, dots, and hyphens; start with a letter or underscore.");
    }
}
