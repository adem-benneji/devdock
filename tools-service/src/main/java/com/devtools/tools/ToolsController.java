package com.devtools.tools;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tools")
public class ToolsController {
    public record Tool(String id, String name, List<JsonTool.Mode> modes, int maxInputLength) {}
    public record JsonRequest(@NotBlank @Size(max = 100_000) String input, @NotNull JsonTool.Mode mode) {}
    public record JsonResult(String toolId, JsonTool.Mode mode, String output) {}
    private final JsonTool json;
    public ToolsController(JsonTool json) { this.json = json; }

    @GetMapping
    List<Tool> catalog() {
        return List.of(new Tool("json-formatter", "JSON Formatter", List.of(JsonTool.Mode.values()), 100_000));
    }

    @PostMapping("/json-formatter")
    JsonResult transform(@Valid @RequestBody JsonRequest request) {
        return new JsonResult("json-formatter", request.mode(), json.transform(request.input(), request.mode()));
    }
}
